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
		if (dbUrl != null && dbUrl.startsWith("postgres://")) {
			try {
				String cleanUrl = dbUrl.substring("postgres://".length());
				String[] authAndHost = cleanUrl.split("@");
				if (authAndHost.length == 2) {
					String[] credentials = authAndHost[0].split(":");
					String[] hostAndDb = authAndHost[1].split("/");
					if (credentials.length == 2 && hostAndDb.length == 2) {
						String user = credentials[0];
						String password = credentials[1];
						String hostAndPort = hostAndDb[0];
						String dbName = hostAndDb[1];
						
						System.setProperty("SPRING_DATASOURCE_URL", "jdbc:postgresql://" + hostAndPort + "/" + dbName);
						System.setProperty("SPRING_DATASOURCE_USERNAME", user);
						System.setProperty("SPRING_DATASOURCE_PASSWORD", password);
					}
				}
			} catch (Exception e) {
				System.setProperty("SPRING_DATASOURCE_URL", dbUrl.replace("postgres://", "jdbc:postgresql://"));
			}
		}
		SpringApplication.run(BillFlowApplication.class, args);
	}

}
