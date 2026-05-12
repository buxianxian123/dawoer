package com.example.dawoer.config;

import com.example.dawoer.model.Category;
import com.example.dawoer.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 应用启动时自动初始化分类数据
 * 按照"按习俗场合"、"按曲种类型"、"按乐器"三大维度创建分类树
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class CategoryInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        // 检查核心分类是否存在，如果不存在则初始化
        boolean needsInit = !categoryRepository.findByName("按体裁类型").isPresent() 
                && !categoryRepository.findByName("按习俗场合").isPresent()
                && !categoryRepository.findByName("按乐器").isPresent();

        if (!needsInit) {
            log.info("核心分类已存在，跳过初始化");
            return;
        }

        log.info("开始初始化达斡尔族传统音乐分类体系...");

        // 1. 按体裁类型（与论文三大核心体裁对应）
        Category genreType = createCategoryIfNotExists("按体裁类型", null);
        createCategoryIfNotExists("扎恩达勒（山野民歌）", genreType);
        createCategoryIfNotExists("乌钦（叙事长诗）", genreType);
        createCategoryIfNotExists("鲁日格勒（民间歌舞）", genreType);
        createCategoryIfNotExists("未分类体裁", genreType);

        // 2. 按习俗场合
        Category customOccasion = createCategoryIfNotExists("按习俗场合", null);
        createCategoryIfNotExists("婚礼", customOccasion);
        createCategoryIfNotExists("葬礼", customOccasion);
        createCategoryIfNotExists("祭祀仪式", customOccasion);
        createCategoryIfNotExists("节庆（如那达慕）", customOccasion);
        createCategoryIfNotExists("劳动（狩猎、农耕）", customOccasion);
        createCategoryIfNotExists("儿童成长/摇篮曲", customOccasion);

        // 3. 按乐器
        Category instrument = createCategoryIfNotExists("按乐器", null);
        createCategoryIfNotExists("木库连（口弦琴）", instrument);
        createCategoryIfNotExists("四胡", instrument);
        createCategoryIfNotExists("其他器乐", instrument);

        log.info("分类体系初始化完成！共创建 {} 个分类", categoryRepository.count());
    }

    private Category createCategoryIfNotExists(String name, Category parent) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> {
                    Category category = Category.builder()
                            .name(name)
                            .parent(parent)
                            .build();
                    Category saved = categoryRepository.save(category);
                    log.debug("创建分类: {} (父分类: {})", name, parent != null ? parent.getName() : "无");
                    return saved;
                });
    }
}
