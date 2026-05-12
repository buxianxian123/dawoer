package com.example.dawoer.controller;

import com.example.dawoer.model.Category;
import com.example.dawoer.repository.CategoryRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@Validated
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository repository;

    @GetMapping
    public List<Category> list() {
        // 使用自定义查询确保 parent 关联被正确加载
        return repository.findAllWithParent();
    }

    @PostMapping
    public ResponseEntity<Category> create(@RequestParam @NotBlank String name,
                                           @RequestParam(required = false) Long parentId) {
        if (repository.findByName(name).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        Category parent = null;
        if (parentId != null) {
            parent = repository.findById(parentId).orElse(null);
        }
        Category saved = repository.save(Category.builder().name(name).parent(parent).build());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestParam @NotBlank String name,
                                           @RequestParam(required = false) Long parentId) {
        Optional<Category> opt = repository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Category c = opt.get();
        c.setName(name);
        c.setParent(parentId == null ? null : repository.findById(parentId).orElse(null));
        return ResponseEntity.ok(repository.save(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 手动触发分类初始化（用于调试或手动创建）
     */
    @PostMapping("/init")
    public ResponseEntity<String> initCategories() {
        // 检查核心分类是否存在
        boolean needsInit = !repository.findByName("按习俗场合").isPresent() 
                && !repository.findByName("按曲种类型").isPresent()
                && !repository.findByName("按乐器").isPresent();

        if (!needsInit) {
            return ResponseEntity.ok("分类已存在，无需初始化");
        }

        // 1. 按习俗场合
        Category customOccasion = createCategoryIfNotExists("按习俗场合", null);
        createCategoryIfNotExists("婚礼", customOccasion);
        createCategoryIfNotExists("葬礼", customOccasion);
        createCategoryIfNotExists("祭祀仪式", customOccasion);
        createCategoryIfNotExists("节庆（如那达慕）", customOccasion);
        createCategoryIfNotExists("劳动（狩猎、农耕）", customOccasion);
        createCategoryIfNotExists("儿童成长/摇篮曲", customOccasion);

        // 2. 按曲种类型
        Category genreType = createCategoryIfNotExists("按曲种类型", null);
        createCategoryIfNotExists("叙事民歌（如《德莫日根》）", genreType);
        createCategoryIfNotExists("仪式歌曲（《扎恩达勒》《哈肯麦》）", genreType);
        createCategoryIfNotExists("舞蹈音乐", genreType);

        // 3. 按乐器
        Category instrument = createCategoryIfNotExists("按乐器", null);
        createCategoryIfNotExists("木库连（口弦琴）", instrument);
        createCategoryIfNotExists("四胡", instrument);
        createCategoryIfNotExists("其他器乐", instrument);

        return ResponseEntity.ok("分类初始化完成！共创建 " + repository.count() + " 个分类");
    }

    private Category createCategoryIfNotExists(String name, Category parent) {
        return repository.findByName(name)
                .orElseGet(() -> {
                    Category category = Category.builder()
                            .name(name)
                            .parent(parent)
                            .build();
                    return repository.save(category);
                });
    }
}
