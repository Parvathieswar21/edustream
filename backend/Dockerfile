# Stage 1: Build the application
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy pom and source code relative to the root build context
COPY backend/pom.xml backend/
COPY backend/src backend/src

# Build the package skipping tests
RUN mvn -f backend/pom.xml -B -DskipTests clean package

# Stage 2: Create the lightweight runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar from the build stage 
# Maven places the target folder inside /workspace/backend/
COPY --from=build /workspace/backend/target/school-management-system-1.0.0.jar /app/app.jar

# Expose port and configure entrypoint
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--server.port=8081"]