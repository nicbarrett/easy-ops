package com.iowaicecreamconcepts.api.common.repository;

import com.iowaicecreamconcepts.api.common.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {
    
    List<Location> findByIsActiveTrueOrderByName();
    
    List<Location> findByTypeAndIsActiveTrueOrderByName(Location.Type type);
    
    List<Location> findByParentIdOrderByName(UUID parentId);
}