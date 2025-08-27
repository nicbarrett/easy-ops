package com.iowaicecreamconcepts.api.common.controller;

import com.iowaicecreamconcepts.api.common.model.Location;
import com.iowaicecreamconcepts.api.common.repository.LocationRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationRepository locationRepository;

    @GetMapping
    public ResponseEntity<List<Location>> getLocations(@RequestParam(required = false) Location.Type type) {
        if (type != null) {
            return ResponseEntity.ok(locationRepository.findByTypeAndIsActiveTrueOrderByName(type));
        }
        return ResponseEntity.ok(locationRepository.findByIsActiveTrueOrderByName());
    }

    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody CreateLocationRequest request) {
        Location location = Location.builder()
                .name(request.getName())
                .type(request.getType())
                .parentId(request.getParentId())
                .build();
        
        Location saved = locationRepository.save(location);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{locationId}")
    public ResponseEntity<Location> getLocation(@PathVariable UUID locationId) {
        return locationRepository.findById(locationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Request DTO
    @Setter
    @Getter
    public static class CreateLocationRequest {
        private String name;
        private Location.Type type;
        private UUID parentId;

    }
}