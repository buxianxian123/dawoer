package com.example.dawoer.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200, columnDefinition = "VARCHAR(200)")
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MediaType type;

    /**
     * 文件在 MinIO 中的对象名，或外部 URL（文献/在线视频观看）。
     */
    @Column(nullable = false, length = 500)
    private String path;

    /**
     * 时长（秒），主要用于音视频，可选。
     */
    private Long duration;

    /**
     * 封面图片 URL，可用于首页推荐、列表缩略图。
     */
    private String coverUrl;

    /**
     * 上传者（采集者）姓名或账号。
     */
    private String uploader;

    /**
     * 记录创建时间（系统自动写入）。
     */
    private LocalDateTime createdAt;

    // ---------- 论文相关的核心语义字段 ----------

    /**
     * 民俗场景 / 使用情境说明。
     * 例如：「婚礼迎亲环节所唱」「春季那达慕赛马开场仪式」等。
     */
    @Column(columnDefinition = "TEXT")
    private String scene;

    /**
     * 歌词原文及汉语大意，可按「原文：...；译文：...」整理。
     */
    @Column(columnDefinition = "TEXT")
    private String lyrics;

    /**
     * 地域信息：如「黑龙江省齐齐哈尔市梅里斯达斡尔族区」等。
     */
    @Column(length = 255)
    private String region;

    /**
     * 主要演唱 / 演奏者（传承人）姓名，可多人，用逗号分隔。
     */
    @Column(length = 255)
    private String performers;

    /**
     * 采集日期（田野录音 / 访谈发生的日期）。
     */
    private LocalDate recordedAt;

    /**
     * 数据来源说明（自录、档案馆、网络视频链接等），便于学术引用。
     */
    @Column(length = 255)
    private String source;

    // --- associations ---

    @ManyToMany
    @JoinTable(name = "media_categories",
            joinColumns = @JoinColumn(name = "media_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"))
    private Set<Category> categories = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "media_tags",
            joinColumns = @JoinColumn(name = "media_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
