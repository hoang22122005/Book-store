package com.bookstore.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.UserGenrePreference;

@Repository
public interface UserGenrePreferenceRepo extends JpaRepository<UserGenrePreference, Integer> {

    @Query("SELECT ugp FROM UserGenrePreference ugp WHERE ugp.user.userId = :userId")
    List<UserGenrePreference> findByUserId(@Param("userId") int userId);

    @Modifying
    @Query("DELETE FROM UserGenrePreference ugp WHERE ugp.user.userId = :userId")
    void deleteByUserId(@Param("userId") int userId);

    @Query("SELECT ugp.genre.genreId FROM UserGenrePreference ugp WHERE ugp.user.userId = :userId")
    List<Integer> findGenreIdsByUserId(@Param("userId") int userId);
}
