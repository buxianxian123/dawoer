package com.example.dawoer.controller;

import com.example.dawoer.model.*;
import com.example.dawoer.repository.CategoryRepository;
import com.example.dawoer.repository.MediaRepository;
import com.example.dawoer.repository.TagRepository;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MinioClient minioClient;
    private final MediaRepository mediaRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    private final String bucket = "media";

    /**
     * 上传媒体：音视频/文档文件 或 外部链接。
     * 同时写入民俗场景、歌词、地域、传承人等信息，方便学术引用。
     */
    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Media> uploadMedia(
            @RequestParam @NotBlank String title,
            @RequestParam(required = false) String description,
            @RequestParam MediaType type,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<String> tags,
            @RequestPart(required = false) MultipartFile file,
            @RequestPart(required = false) MultipartFile coverFile,
            @RequestParam(required = false) String url,
            // 论文相关字段：全部可选，你可以根据采集情况慢慢补
            @RequestParam(required = false) String scene,
            @RequestParam(required = false) String lyrics,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String performers,
            @RequestParam(required = false) String recordedAt, // 格式：yyyy-MM-dd
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String uploader
    ) throws Exception {

        if (type == MediaType.LINK) {
            if (url == null) throw new IllegalArgumentException("URL 不能为空");
        } else {
            if (file == null) throw new IllegalArgumentException("文件不能为空");
        }

        Media media = new Media();
        media.setTitle(title);
        media.setDescription(description);
        media.setType(type);

        // 处理分类
        if (categoryIds != null && !categoryIds.isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(categoryIds);
            media.getCategories().addAll(categories);
        }

        // 处理标签（不存在则创建）
        if (tags != null) {
            for (String t : tags) {
                Tag tag = tagRepository.findByName(t)
                        .orElseGet(() -> tagRepository.save(Tag.builder().name(t).build()));
                media.getTags().add(tag);
            }
        }

        // 论文相关字段
        media.setScene(scene);
        media.setLyrics(lyrics);
        media.setRegion(region);
        media.setPerformers(performers);
        media.setSource(source);
        media.setUploader(uploader);
        if (recordedAt != null && !recordedAt.isBlank()) {
            try {
                media.setRecordedAt(LocalDate.parse(recordedAt));
            } catch (Exception e) {
                log.warn("recordedAt 解析失败: {}", recordedAt, e);
            }
        }

        String objectName;
        if (type == MediaType.LINK) {
            objectName = url; // 直接记录外链
        } else {
            // 生成对象名: uuid + 扩展名
            String ext = Optional.ofNullable(file.getOriginalFilename())
                    .filter(fn -> fn.contains("."))
                    .map(fn -> fn.substring(fn.lastIndexOf('.')))
                    .orElse("");
            objectName = UUID.randomUUID() + ext;

            // 上传到 MinIO
            PutObjectArgs putArgs = PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build();
            minioClient.putObject(putArgs);
        }

        media.setPath(objectName);

        // 处理封面图：如果有上传封面文件，保存到MinIO并设置coverUrl
        if (coverFile != null && !coverFile.isEmpty()) {
            String coverExt = Optional.ofNullable(coverFile.getOriginalFilename())
                    .filter(fn -> fn.contains("."))
                    .map(fn -> fn.substring(fn.lastIndexOf('.')))
                    .orElse(".jpg");
            String coverObjectName = "covers/" + UUID.randomUUID() + coverExt;

            PutObjectArgs coverPutArgs = PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(coverObjectName)
                    .stream(coverFile.getInputStream(), coverFile.getSize(), -1)
                    .contentType(coverFile.getContentType())
                    .build();
            minioClient.putObject(coverPutArgs);

            // 保存封面对象名到数据库（不保存临时链接，因为会过期）
            // 在获取媒体详情时，会通过 /api/media/{id}/cover 接口生成临时链接
            media.setCoverUrl(coverObjectName);
        }

        Media saved = mediaRepository.save(media);
        
        // 重新加载 Media 并确保 categories 的 parent 被正确加载，避免序列化问题
        Media loaded = mediaRepository.findByIdWithAssociations(saved.getId()).orElse(saved);

        return ResponseEntity.ok(loaded);
    }

    /**
     * 获取元数据
     */
    @GetMapping("/{id}")
    public ResponseEntity<Media> getMedia(@PathVariable Long id) {
        return mediaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 获取文件/链接的可访问 URL
     */
    @GetMapping("/{id}/url")
    public ResponseEntity<String> getMediaUrl(@PathVariable Long id) throws Exception {
        Media media = mediaRepository.findById(id).orElse(null);
        if (media == null) return ResponseEntity.notFound().build();

        String path = media.getPath();
        if (media.getType() == MediaType.LINK) {
            return ResponseEntity.ok(path);
        }
        String presignedUrl = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .bucket(bucket)
                        .object(path)
                        .method(Method.GET)
                        .expiry((int) Duration.ofHours(2).toSeconds())
                        .build());
        return ResponseEntity.ok(presignedUrl);
    }

    /**
     * 获取封面图的临时访问 URL
     */
    @GetMapping("/{id}/cover")
    public ResponseEntity<String> getCoverUrl(@PathVariable Long id) throws Exception {
        Media media = mediaRepository.findById(id).orElse(null);
        if (media == null || media.getCoverUrl() == null || media.getCoverUrl().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        String coverObjectName = media.getCoverUrl();
        // 如果coverUrl已经是完整URL（外部链接），直接返回
        if (coverObjectName.startsWith("http://") || coverObjectName.startsWith("https://")) {
            return ResponseEntity.ok(coverObjectName);
        }

        // 否则从MinIO生成临时链接
        String presignedUrl = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .bucket(bucket)
                        .object(coverObjectName)
                        .method(Method.GET)
                        .expiry((int) Duration.ofHours(2).toSeconds())
                        .build());
        return ResponseEntity.ok(presignedUrl);
    }

    /**
     * 分页 & 筛选查询
     * 支持多维度分类筛选（AND关系，即同时满足多个维度）
     */
    @GetMapping
    public Page<Media> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<Long> tagIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        // 计算需要匹配的分类数量（用于HAVING子句，确保同时满足所有选中的分类）
        Long categoryCount = (categoryIds != null && !categoryIds.isEmpty()) 
                ? (long) categoryIds.size() 
                : null;
        return mediaRepository.search(keyword, categoryIds, tagIds, categoryCount, pageable);
    }
}
