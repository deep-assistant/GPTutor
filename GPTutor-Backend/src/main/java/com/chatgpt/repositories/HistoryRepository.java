package com.chatgpt.repositories;

import com.chatgpt.entity.History;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface HistoryRepository extends CrudRepository<History, UUID> {
    Page<History> findAllByVkUserId(UUID vkId, PageRequest pageable);
    void deleteAllByVkUserId(UUID vkId);

    @Query("SELECT DISTINCT h FROM History h " +
            "INNER JOIN Message m ON h.id = m.history.id " +
            "WHERE h.vkUser.id = :vkId " +
            "AND (LOWER(h.title) LIKE LOWER(concat('%', :substring, '%')) " +
            "OR LOWER(m.content) LIKE LOWER(concat('%', :substring, '%')))")
    Page<History> findByVkUserIdAndByLessonNameOrMessageContentContainingIgnoreCase(@Param("vkId") UUID vkId, @Param("substring") String substring, PageRequest pageable);

    @Query("SELECT DISTINCT h FROM History h " +
            "INNER JOIN Message m ON h.id = m.history.id " +
            "WHERE h.vkUser.id = :vkId " +
            "AND (:substring IS NULL OR :substring = '' OR LOWER(h.title) LIKE LOWER(concat('%', :substring, '%')) " +
            "OR LOWER(m.content) LIKE LOWER(concat('%', :substring, '%'))) " +
            "AND (:type IS NULL OR h.type = :type) " +
            "AND (:lessonName IS NULL OR h.lessonName = :lessonName) " +
            "AND (:dateFrom IS NULL OR h.lastUpdated >= CAST(:dateFrom AS timestamp)) " +
            "AND (:dateTo IS NULL OR h.lastUpdated <= CAST(:dateTo AS timestamp))")
    Page<History> findByVkUserIdWithFilters(@Param("vkId") UUID vkId, 
                                          @Param("substring") String substring,
                                          @Param("type") String type,
                                          @Param("lessonName") String lessonName,
                                          @Param("dateFrom") String dateFrom,
                                          @Param("dateTo") String dateTo,
                                          PageRequest pageable);
}
