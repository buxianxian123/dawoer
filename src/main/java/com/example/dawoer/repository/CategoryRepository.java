package com.example.dawoer.repository;

import com.example.dawoer.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    /**
     * 查询所有分类，并加载 parent 关联（避免懒加载问题）
     */
    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.parent ORDER BY c.id")
    List<Category> findAllWithParent();
}
