package com.iowaicecreamconcepts.api.inventory.repository;

import com.iowaicecreamconcepts.api.inventory.model.CurrentStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CurrentStockRepository extends JpaRepository<CurrentStock, UUID> {
    
    Optional<CurrentStock> findByItemIdAndLocationId(UUID itemId, UUID locationId);
    
    List<CurrentStock> findByLocationId(UUID locationId);
    
    List<CurrentStock> findByItemId(UUID itemId);
    
    @Query("SELECT cs FROM CurrentStock cs JOIN InventoryItem ii ON cs.itemId = ii.id WHERE cs.quantity < ii.parStockLevel")
    List<CurrentStock> findBelowParStock();
    
    @Query("SELECT cs FROM CurrentStock cs JOIN InventoryItem ii ON cs.itemId = ii.id WHERE cs.locationId = :locationId AND cs.quantity < ii.parStockLevel")
    List<CurrentStock> findBelowParStockByLocation(@Param("locationId") UUID locationId);
}