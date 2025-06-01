# Use Maven to build the Spring Boot app
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -DskipTests

# Use a lightweight JDK to run the built JAR
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/practiceproedit-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
