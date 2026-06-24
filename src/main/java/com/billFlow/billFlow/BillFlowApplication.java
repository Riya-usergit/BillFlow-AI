package com.billFlow.billFlow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BillFlowApplication {

	public static void main(String[] args) {
		String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
		if (dbUrl == null) {
			dbUrl = System.getenv("DATABASE_URL");
		}
		
		if (dbUrl != null) {
			dbUrl = dbUrl.trim();
			// Strip leading and trailing quotes if present
			if (dbUrl.startsWith("\"") && dbUrl.endsWith("\"")) {
				dbUrl = dbUrl.substring(1, dbUrl.length() - 1).trim();
			}
			if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
				dbUrl = dbUrl.substring(1, dbUrl.length() - 1).trim();
			}
			
			System.out.println("[DB_INIT] Detected database URL: " + dbUrl);
			
			if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
				try {
					String protocol = dbUrl.startsWith("postgres://") ? "postgres://" : "postgresql://";
					String cleanUrl = dbUrl.substring(protocol.length());
					String[] authAndHost = cleanUrl.split("@");
					if (authAndHost.length == 2) {
						String[] credentials = authAndHost[0].split(":");
						String[] hostAndDb = authAndHost[1].split("/");
						if (credentials.length == 2 && hostAndDb.length == 2) {
							String user = credentials[0];
							String password = credentials[1];
							String hostAndPort = hostAndDb[0];
							String dbName = hostAndDb[1];
							
							String jdbcUrl = "jdbc:postgresql://" + hostAndPort + "/" + dbName;
							System.setProperty("SPRING_DATASOURCE_URL", jdbcUrl);
							System.setProperty("SPRING_DATASOURCE_USERNAME", user);
							System.setProperty("SPRING_DATASOURCE_PASSWORD", password);
							System.out.println("[DB_INIT] Successfully parsed and set JDBC URL: " + jdbcUrl);
						}
					}
				} catch (Exception e) {
					String fallbackUrl = dbUrl.startsWith("postgres://") ? 
							dbUrl.replace("postgres://", "jdbc:postgresql://") : 
							dbUrl.replace("postgresql://", "jdbc:postgresql://");
					System.setProperty("SPRING_DATASOURCE_URL", fallbackUrl);
					System.out.println("[DB_INIT] Error parsing URL, set fallback: " + fallbackUrl);
				}
			} else {
				System.out.println("[DB_INIT] URL already in JDBC format or other: " + dbUrl);
			}
		} else {
			System.out.println("[DB_INIT] No database URL env variable detected, falling back to application.properties");
		}
		SpringApplication.run(BillFlowApplication.class, args);
	}

}
