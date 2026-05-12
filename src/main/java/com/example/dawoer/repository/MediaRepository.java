package com.example.dawoer.repository;

import com.example.dawoer.model.Media;
import com.example.dawoer.model.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {

    @Query(value = "SELECT DISTINCT m.* FROM media m " +
            "LEFT JOIN media_categories mc ON m.id = mc.media_id " +
            "LEFT JOIN media_tags mt ON m.id = mt.media_id " +
            "WHERE (:keyword IS NULL OR LOWER(CAST(m.title AS TEXT)) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:#{#tagIds == null || #tagIds.isEmpty()} = true OR mt.tag_id IN (:tagIds)) " +
            "AND (:#{#categoryIds == null || #categoryIds.isEmpty()} = true OR m.id IN (" +
            "  SELECT mc2.media_id FROM media_categories mc2 " +
            "  WHERE mc2.category_id IN (:categoryIds) " +
            "  GROUP BY mc2.media_id " +
            "  HAVING COUNT(DISTINCT mc2.category_id) = :categoryCount" +
            "))",
            countQuery = "SELECT COUNT(DISTINCT m.id) FROM media m " +
                    "LEFT JOIN media_tags mt ON m.id = mt.media_id " +
                    "WHERE (:keyword IS NULL OR LOWER(CAST(m.title AS TEXT)) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                    "AND (:#{#tagIds == null || #tagIds.isEmpty()} = true OR mt.tag_id IN (:tagIds)) " +
                    "AND (:#{#categoryIds == null || #categoryIds.isEmpty()} = true OR m.id IN (" +
                    "  SELECT mc2.media_id FROM media_categories mc2 " +
                    "  WHERE mc2.category_id IN (:categoryIds) " +
                    "  GROUP BY mc2.media_id " +
                    "  HAVING COUNT(DISTINCT mc2.category_id) = :categoryCount" +
                    "))",
            nativeQuery = true)
    Page<Media> search(@Param("keyword") String keyword,
                       @Param("categoryIds") List<Long> categoryIds,
                       @Param("tagIds") List<Long> tagIds,
                       @Param("categoryCount") Long categoryCount,
                       Pageable pageable);

    List<Media> findByType(MediaType type);

    /**
     * 根据 ID 查找 Media，并加载 categories 和它们的 parent（避免懒加载序列化问题）
     */
    @Query("SELECT DISTINCT m FROM Media m " +
           "LEFT JOIN FETCH m.categories c " +
           "LEFT JOIN FETCH c.parent " +
           "LEFT JOIN FETCH m.tags " +
           "WHERE m.id = :id")
    java.util.Optional<Media> findByIdWithAssociations(@Param("id") Long id);
}
