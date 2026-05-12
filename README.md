# 达斡尔族传统音乐数字资源库 - 项目说明文档

本文档旨在为开发者提供一个从零开始搭建、配置并运行“达斡尔族传统音乐数字资源库”项目的完整指南。即使您在一台全新的主机上，也可以按照本文档的步骤顺利启动项目。

## 1. 环境准备

在开始之前，请确保您的电脑上安装了以下软件。如果尚未安装，请根据指引完成安装和配置。

### 1.1. Git

Git 是代码版本管理工具，用于从 GitHub 克隆项目代码。

- **下载地址**：[git-scm.com/downloads](https://git-scm.com/downloads)
- **安装**：下载对应您操作系统的安装包，按照默认设置完成安装即可。
- **验证**：打开终端（或 PowerShell/CMD），输入以下命令，如果能看到版本号，则说明安装成功。
  ```bash
  git --version
  ```

### 1.2. Java 开发工具包 (JDK)

项目后端使用 Java 语言开发，需要 JDK 17 或更高版本。

- **下载地址**：推荐使用 [Oracle JDK](https://www.oracle.com/java/technologies/downloads/#jdk17) 或开源的 [OpenJDK](https://adoptium.net/) (选择 Temurin 版本)。
- **安装**：下载并运行安装程序。
- **配置环境变量** (Windows 示例)：
  1.  在系统属性中找到“高级系统设置” -> “环境变量”。
  2.  在“系统变量”中新建一个 `JAVA_HOME` 变量，值为你的 JDK 安装路径（例如 `C:\Program Files\Java\jdk-17`）。
  3.  编辑 `Path` 变量，在末尾添加 `%JAVA_HOME%\bin`。
- **验证**：打开新的终端，输入以下命令，如果能看到版本号，则说明配置成功。
  ```bash
  java -version
  javac -version
  ```

### 1.3. Maven

Maven 是 Java 项目的管理和构建工具。（尽管本项目使用 Gradle Wrapper，但安装 Maven 也是 Java 开发的标准实践）。

- **下载地址**：[maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)
- **安装**：下载二进制的 zip 压缩包，解压到一个没有中文和空格的路径（例如 `D:\maven`）。
- **配置环境变量** (Windows 示例)：
  1.  在“系统变量”中新建一个 `MAVEN_HOME` 变量，值为你的 Maven 解压路径。
  2.  编辑 `Path` 变量，在末尾添加 `%MAVEN_HOME%\bin`。
- **验证**：打开新的终端，输入以下命令，如果能看到版本号，则说明配置成功。
  ```bash
  mvn -v
  ```

### 1.4. Node.js 和 npm

项目前端使用 Node.js 环境，npm 是其包管理工具。

- **下载地址**：[nodejs.org](https://nodejs.org/) (推荐下载 LTS 长期支持版本)。
- **安装**：下载并运行安装程序，安装程序会自动配置好 `node` 和 `npm` 命令。
- **验证**：打开终端，输入以下命令，如果能看到版本号，则说明安装成功。
  ```bash
  node -v
  npm -v
  ```

### 1.5. Docker Desktop

Docker 用于快速启动项目的依赖服务（PostgreSQL 数据库和 MinIO 对象存储）。

- **下载地址**：[docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **安装**：下载并运行安装程序。Windows 系统可能需要启用 WSL 2 (Windows Subsystem for Linux)，安装程序会引导你完成此操作。
- **启动**：安装完成后，启动 Docker Desktop 应用，并等待其状态显示为“running”。

## 2. 项目部署与启动

完成环境准备后，可以开始部署和启动项目。

### 2.1. 克隆项目代码

打开终端，选择一个合适的目录，使用 `git clone` 命令从 GitHub 克隆项目代码。

```bash
# 将下面的 URL 替换为你的项目实际 GitHub 地址
git clone https://github.com/buxianxian123/dawoer.git

# 进入项目根目录
cd dawoer-music-project
```

### 2.2. 启动后端依赖服务 (Docker)

在项目的根目录下（即包含 `docker-compose.yml` 文件的目录），执行以下命令来启动数据库和对象存储服务。

```bash
# 此命令会在后台启动 Postgres 和 MinIO 容器
docker-compose up -d
```

- **验证服务**：可以执行 `docker ps` 命令，如果看到 `postgres` 和 `minio` 两个容器的状态为 `Up`，则说明服务启动成功。
- **访问 MinIO 控制台**：浏览器打开 `http://localhost:9001`，使用用户名 `minio` 和密码 `minio123` 登录，可以看到一个名为 `media` 的存储桶 (Bucket) 已被自动创建。

### 2.3. 启动后端 Spring Boot 应用

项目使用了 Gradle Wrapper，无需手动安装 Gradle。

在项目根目录下，打开一个新的终端，执行以下命令：

```bash
# Windows 系统
.\gradlew.bat bootRun

# macOS / Linux 系统
./gradlew bootRun
```

当看到类似 `Started DawoerApplication in X.XXX seconds` 的日志时，说明后端应用已成功启动在 `8080` 端口。

### 2.4. 启动前端 React 应用

打开第三个终端，进入 `frontend` 目录，安装依赖并启动开发服务器。

```bash
# 进入前端项目目录
cd frontend

# 安装项目依赖（首次运行时需要）
npm install

# 启动前端开发服务器
npm run dev
```

当看到类似 `➜ Local: http://localhost:5173/` 的输出时，说明前端应用已成功启动。

## 3. 访问和使用

- **访问网站**：浏览器打开 `http://localhost:5173`。
- **初始化分类**：首次使用时，进入“资料录入”页面，会提示“暂无分类”。点击“所属分类”标签旁边的 **[初始化分类]** 按钮，系统会自动创建预设的分类体系。
- **资料录入**：在“资料录入”页面，可以上传音视频、图片、文档，或添加外部链接，并填写相关的民俗学信息。
- **作品浏览**：在“作品浏览”页面，可以通过左侧的筛选器（支持多选）和顶部的搜索框来查找已录入的资料。

## 4. 项目结构简介

- **`/` (根目录)**：包含后端 Spring Boot 项目（基于 Gradle）、Docker 配置文件等。
- **`src/main/java`**：后端 Java 源代码。
  - `com.example.dawoer.model`：数据模型（实体类）。
  - `com.example.dawoer.repository`：数据库操作接口。
  - `com.example.dawoer.controller`：API 接口控制器。
  - `com.example.dawoer.config`：应用配置，如 MinIO 和分类初始化。
- **`src/main/resources`**：后端资源文件。
  - `application.properties`：应用配置文件，包含数据库、MinIO、文件上传大小限制等。
- **`frontend/`**：前端 React 项目（基于 Vite）。
  - `src/pages`：各个页面的组件。
  - `src/components`：可复用的 UI 组件。
  - `src/style.css`：全局样式表。
  - `vite.config.ts`：Vite 配置文件，包含代理设置。

---

至此，您已完成项目的全部署和启动。祝您使用愉快！
