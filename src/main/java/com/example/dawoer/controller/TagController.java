package com.example.dawoer.controller;

import com.example.dawoer.model.Tag;
import com.example.dawoer.repository.TagRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tags")
@Validated
@RequiredArgsConstructor
public class TagController {

    private final TagRepository repository;

    @GetMapping
    public List<Tag> list() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<Tag> create(@RequestParam @NotBlank String name) {
        if (repository.findByName(name).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        Tag saved = repository.save(Tag.builder().name(name).build());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tag> update(@PathVariable Long id, @RequestParam @NotBlank String name) {
        Optional<Tag> opt = repository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Tag t = opt.get();
        t.setName(name);
        return ResponseEntity.ok(repository.save(t));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
