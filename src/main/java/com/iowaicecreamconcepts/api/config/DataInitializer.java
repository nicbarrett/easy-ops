package com.iowaicecreamconcepts.api.config;

import com.iowaicecreamconcepts.api.auth.model.User;
import com.iowaicecreamconcepts.api.auth.repository.UserRepository;
import com.iowaicecreamconcepts.api.common.model.Location;
import com.iowaicecreamconcepts.api.common.repository.LocationRepository;
import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import com.iowaicecreamconcepts.api.inventory.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final InventoryItemRepository inventoryItemRepository;

    @Override
    public void run(String... args) {
        initializeLocations();
        initializeUsers();
        initializeSampleInventoryItems();
        log.info("Data initialization completed");
    }

    private void initializeLocations() {
        if (locationRepository.count() == 0) {
            List<Location> locations = Arrays.asList(
                    Location.builder()
                            .name("Main Shop")
                            .type(Location.Type.SHOP)
                            .build(),
                    Location.builder()
                            .name("Truck 1")
                            .type(Location.Type.TRUCK)
                            .build(),
                    Location.builder()
                            .name("Truck 2")
                            .type(Location.Type.TRUCK)
                            .build(),
                    Location.builder()
                            .name("Freezer A")
                            .type(Location.Type.FREEZER)
                            .build(),
                    Location.builder()
                            .name("Freezer B")
                            .type(Location.Type.FREEZER)
                            .build(),
                    Location.builder()
                            .name("Main Storage")
                            .type(Location.Type.STORAGE)
                            .build()
            );

            locationRepository.saveAll(locations);
            log.info("Initialized {} locations", locations.size());
        }
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            List<User> users = Arrays.asList(
                    User.builder()
                            .name("Admin User")
                            .email("admin@sweetswirls.com")
                            .passwordHash("hashed_admin_password") // TODO: Use proper password hashing
                            .role(User.Role.ADMIN)
                            .build(),
                    User.builder()
                            .name("Production Lead")
                            .email("production@sweetswirls.com")
                            .passwordHash("hashed_production_password")
                            .role(User.Role.PRODUCTION_LEAD)
                            .build(),
                    User.builder()
                            .name("Shift Lead")
                            .email("shift@sweetswirls.com")
                            .passwordHash("hashed_shift_password")
                            .role(User.Role.SHIFT_LEAD)
                            .build(),
                    User.builder()
                            .name("Team Member")
                            .email("team@sweetswirls.com")
                            .passwordHash("hashed_team_password")
                            .role(User.Role.TEAM_MEMBER)
                            .build()
            );

            userRepository.saveAll(users);
            log.info("Initialized {} users", users.size());
        }
    }

    private void initializeSampleInventoryItems() {
        if (inventoryItemRepository.count() == 0) {
            Location mainShop = locationRepository.findByTypeAndIsActiveTrueOrderByName(Location.Type.SHOP)
                    .stream().findFirst().orElse(null);
            
            if (mainShop != null) {
                List<InventoryItem> items = Arrays.asList(
                        InventoryItem.builder()
                                .name("Vanilla Base")
                                .category(InventoryItem.Category.BASE)
                                .unit("gallons")
                                .parStockLevel(10.0)
                                .defaultLocationId(mainShop.getId())
                                .sku("VAN-BASE-001")
                                .notes("Primary vanilla ice cream base")
                                .build(),
                        InventoryItem.builder()
                                .name("Chocolate Base")
                                .category(InventoryItem.Category.BASE)
                                .unit("gallons")
                                .parStockLevel(8.0)
                                .defaultLocationId(mainShop.getId())
                                .sku("CHOC-BASE-001")
                                .notes("Rich chocolate ice cream base")
                                .build(),
                        InventoryItem.builder()
                                .name("Chocolate Chips")
                                .category(InventoryItem.Category.MIX_IN)
                                .unit("lbs")
                                .parStockLevel(5.0)
                                .defaultLocationId(mainShop.getId())
                                .sku("CHOC-CHIP-001")
                                .build(),
                        InventoryItem.builder()
                                .name("Caramel Swirl")
                                .category(InventoryItem.Category.MIX_IN)
                                .unit("quarts")
                                .parStockLevel(12.0)
                                .defaultLocationId(mainShop.getId())
                                .sku("CAR-SWIRL-001")
                                .build(),
                        InventoryItem.builder()
                                .name("Pint Containers")
                                .category(InventoryItem.Category.PACKAGING)
                                .unit("pieces")
                                .parStockLevel(200.0)
                                .defaultLocationId(mainShop.getId())
                                .sku("PINT-CONT-001")
                                .build(),
                        InventoryItem.builder()
                                .name("Quart Containers")
                                .category(InventoryItem.Category.PACKAGING)
                                .unit("pieces")
                                .parStockLevel(100.0)
                                .defaultLocationId(mainShop.getId())
                                .sku("QUART-CONT-001")
                                .build(),
                        InventoryItem.builder()
                                .name("Bottled Water")
                                .category(InventoryItem.Category.BEVERAGE)
                                .unit("cases")
                                .parStockLevel(5.0)
                                .defaultLocationId(mainShop.getId())
                                .sku("WATER-001")
                                .build()
                );

                inventoryItemRepository.saveAll(items);
                log.info("Initialized {} sample inventory items", items.size());
            }
        }
    }
}