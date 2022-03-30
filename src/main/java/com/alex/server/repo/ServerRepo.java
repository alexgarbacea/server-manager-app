package com.alex.server.repo;

import com.alex.server.model.Server;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServerRepo extends JpaRepository<Server, Long> {//Long type -> same type as id
    Server findByIpAddress(String ipAddress);//findBy + key to search by !!! Only use simple method on unique keys !!!
}
