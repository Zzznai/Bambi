# Bambi Marketplace - Пълна документация на проекта

## Съдържание
1. [Преглед на проекта](#преглед-на-проекта)
2. [Технологичен стек](#технологичен-стек)
3. [Архитектура на backend](#архитектура-на-backend)
4. [Схема на базата данни](#схема-на-базата-данни)
5. [API крайни точки](#api-крайни-точки)
6. [Преглед на frontend](#преглед-на-frontend)
7. [Инсталация и настройка](#инсталация-и-настройка)

---

## Преглед на проекта

**Bambi** е приложение за пазарлак на облекло с пълен стек, което позволява на потребителите да купуват и продават дрехи. Платформата включва удостоверяване на потребител, управление на обяви, качване на изображения, проследяване на покупки и административни контроли.

### Ключови функции:
- Регистрация и удостоверяване на потребител с JWT
- Създаване и управление на обяви за облекло
- Преглед и търсене на обяви с филтри (категория, цена, размер, състояние)
- Управление на покупки със проследяване на статуса
- Профили на потребители и история на продажбите
- Административен панел за управление на потребители и съдържание
- Облачно съхранилище на изображения (Cloudinary)
- Адаптивен frontend базиран на React

---

## Технологичен стек

### Backend
- **Runtime**: .NET 8+ (C#)
- **Framework**: ASP.NET Core Web API
- **База данни**: SQL Server (LocalDB при разработка)
- **ORM**: Entity Framework Core
- **Удостоверяване**: JWT (JSON Web Tokens)
- **Сигурност на пароли**: BCrypt.Net
- **Документация на API**: OpenAPI/Swagger
- **Валидация**: FluentValidation
- **Картографиране**: AutoMapper
- **Съхранилище на изображения**: Cloudinary (облачна CDN)
- **CORS**: Конфигурируема поддръжка за кръстосано произход

### Frontend
- **Runtime**: Node.js
- **Framework**: React 18.3.1
- **Инструмент за сборка**: Vite 6.0.7
- **HTTP клиент**: Fetch API с персонализиран обвивка
- **Управление на състояние**: React Context API (удостоверяване)
- **Маршрутизиране**: Персонализиран маршрутизатор базиран на хеш
- **Стилизиране**: CSS (персонализирани styles.css)

### Инструменти за разработка
- **Формат на решението**: Visual Studio Solution (.slnx)
- **Мениджър на пакети**: NuGet (Backend), npm (Frontend)

---

## Архитектура на backend

### Структура на проекта

```
Bambi.API/                 # Главна входна точка на API
├── Controllers/           # Обработчици на HTTP заявки
├── Middleware/           # Кръстосани проблеми (обработка на изключения)
├── Common/               # Споделени помощни програми
├── Program.cs            # Конфигурация и внедряване на зависимости
└── appsettings.json      # Конфигурация

Bambi.Services/           # Слой на бизнес логика
├── Auth/                 # Услуги за удостоверяване
├── Users/                # Управление на потребители
├── Listings/             # Управление на обяви
├── Purchases/            # Обработка на покупки
├── Categories/           # Управление на категории
├── ListingImages/        # Управление на изображения
├── Dtos/                 # Обекти за прехвърляне на данни
├── Mapping/              # Профили на AutoMapper
└── Validation/           # Правила за валидация

Bambi.Repositories/       # Слой за достъп до данни
├── Users/                # Достъп до данни за потребители
├── Categories/           # Достъп до данни за категории
├── Listings/             # Достъп до данни за обяви
├── Purchases/            # Достъп до данни за покупки
├── ListingImages/        # Достъп до данни на изображения
└── Common/               # Споделени интерфейси на хранилище

Bambi.Data/               # Модели на данни и база данни
├── Entities/             # Модели на субекти на база данни
├── Enums/                # Типове на изброявания
├── Migrations/           # Миграции на EF Core
└── AppDbContext.cs       # Контекст на база данни
```

### Архитектура на слоеве

**Слой за представяне (Bambi.API)**
- Контролери обработват HTTP заявки и отговори
- Валидация на входни данни чрез FluentValidation
- Връща DTOs (не суровите субекти)

**Слой на бизнес логика (Bambi.Services)**
- IAuthService, IUserService, IListingService, IPurchaseService, ICategoryService, IListingImageService
- Валидира правилата на бизнеса
- Координира достъп до хранилище
- Обработва проверки на оразуми
- Картографира субекти на DTOs

**Слой за достъп до данни (Bambi.Repositories)**
- Реализира модел на хранилище
- Абстрахира заявки на база данни
- Осигурява филтриране, сортиране, пагинация
- Обработва сложни заявки

**Слой на данни (Bambi.Data)**
- Модели на Entity Framework Core
- Конфигурация на контекст на база данни
- Връзки и ограничения на субектите

---

## Database Schema

### Entity Relationship Diagram (Text Format)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ USERS                         CATEGORIES         LISTINGS              │
├─────────────────┐         ├──────────────┐   ├──────────────────────┤  │
│ Id (PK)         │         │ Id (PK)      │   │ Id (PK)              │  │
│ Username (UQ)   │         │ Name         │   │ Title                │  │
│ Email (UQ)      │         │ Description  │   │ Description          │  │
│ PasswordHash    │         └──────────────┘   │ Price (decimal)      │  │
│ PhoneNumber     │                │           │ Size                 │  │
│ City            │                │           │ Condition (enum)     │  │
│ Description     │                │           │ IsAvailable          │  │
│ ProfilePicUrl   │                └────────┬──│ CategoryId (FK)      │  │
│ Role (enum)     │                         │  │ SellerId (FK)        │  │
│ CreatedAt       │◄────────────────────────┼──│ CreatedAt            │  │
└─────────────────┘        ▲                │  └──────────────────────┘  │
     │                     │                │          │                  │
     │                ┌────────────┐        │          │                  │
     │                │ PURCHASES  │        │    ┌──────────────────────┐ │
     ├───────────────→│ Id (PK)    │        │    │ LISTING_IMAGES       │ │
     │                │ PricePaid  │◄───────┘    ├──────────────────────┤ │
     │                │ DeliveryAddr           │ Id (PK)              │ │
     │                │ Status     │           │ Url                  │ │
     │                │ Note       │           │ PublicId (Cloudinary)│ │
     │                │ PurchasedAt│           │ ListingId (FK)       │ │
     │                │ BuyerId(FK)│           │ UploadedAt           │ │
     │                │ ListingId  │           └──────────────────────┘ │
     │                │            │                    ▲                │
     └───────────────→│ (FK)       │                    │                │
                      └────────────┘                    └────────────────┘
```

### Детали на таблиците

#### **Таблица на потребители**
```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(256) NOT NULL,
    PhoneNumber NVARCHAR(20),
    City NVARCHAR(100),
    Description NVARCHAR(500),
    ProfilePicUrl NVARCHAR(500),
    ProfilePicPublicId NVARCHAR(200),
    Role INT NOT NULL DEFAULT 0,  -- 0: Потребител, 2: Администратор
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE()
);
```

**Ключови ограничения:**
- `Username` и `Email` са уникални
- `Role` по подразумение "Потребител" (0)
- `CreatedAt` автоматично се задава на текущото UTC време

#### **Таблица на категории**
```sql
CREATE TABLE Categories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500)
);
```

**Ключови ограничения:**
- `Name` е индексирано за бързо филтриране

#### **Таблица на обяви**
```sql
CREATE TABLE Listings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(100) NOT NULL,
    Description NVARCHAR(1000),
    Price DECIMAL(18,2) NOT NULL,
    Size NVARCHAR(10) NOT NULL,
    Condition INT NOT NULL,  -- 0: Лошо, 1: Добро, 2: Като ново, 3: Ново
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    SellerId INT NOT NULL FOREIGN KEY REFERENCES Users(Id) ON DELETE RESTRICT,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(Id) ON DELETE RESTRICT
);
```

**Ключови ограничения:**
- `IsAvailable` по подразумение е истина (1)
- `CreatedAt` автоматично се задава на текущото UTC време
- Чужди ключове използват `ON DELETE RESTRICT` за предотвратяване на осиротели данни

#### **Таблица на изображения на обяви**
```sql
CREATE TABLE ListingImages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Url NVARCHAR(500) NOT NULL,
    PublicId NVARCHAR(200),
    UploadedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ListingId INT NOT NULL FOREIGN KEY REFERENCES Listings(Id) ON DELETE CASCADE
);
```

**Ключови ограничения:**
- `UploadedAt` автоматично се задава на текущото UTC време
- `ON DELETE CASCADE`: изтриването на обява изтрива всички свързани изображения

#### **Таблица на покупки**
```sql
CREATE TABLE Purchases (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PricePaid DECIMAL(18,2) NOT NULL,
    DeliveryAddress NVARCHAR(300),
    Status INT NOT NULL DEFAULT 0,  -- 0: Pending, 1: Потвърдено, 2: Изпратено, 3: Доставено
    Note NVARCHAR(500),
    PurchasedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    BuyerId INT NOT NULL FOREIGN KEY REFERENCES Users(Id) ON DELETE RESTRICT,
    ListingId INT NOT NULL FOREIGN KEY REFERENCES Listings(Id) ON DELETE RESTRICT
);
```

**Ключови ограничения:**
- `Status` по подразумение е "Pending" (0)
- `PurchasedAt` автоматично се задава на текущото UTC време

---

## Модели на субектите (Обяснение на кода)

### Субект на потребител (`Bambi.Data/Entities/User.cs`)
```csharp
public class User
{
    public int Id { get; set; }                  // Първичен ключ
    public string Username { get; set; }         // Макс 50 знака, уникален
    public string Email { get; set; }            // Макс 150 знака, уникален
    public string PasswordHash { get; set; }     // Хеширана парола с BCrypt
    public string? PhoneNumber { get; set; }     // По избор, макс 20 знака
    public string? City { get; set; }            // По избор местоположение
    public string? Description { get; set; }     // Биография на профила
    public string? ProfilePicUrl { get; set; }   // URL на Cloudinary
    public string? ProfilePicPublicId { get; set; } // ID на Cloudinary за изтриване
    public UserRole Role { get; set; }           // Администратор или потребител
    public DateTime CreatedAt { get; set; }      // Автоматично задаване на UTC сега
    
    // Свойства за навигация
    public ICollection<Listing> Listings { get; set; }      // Елементи списък продавач
    public ICollection<Purchase> Purchases { get; set; }    // Елементи купи купувач
}
```

**Правила на бизнеса:**
- Потребителското име и имейл трябва да са глобално уникални
- Паролите се хешират с BCrypt (никога не се съхраняват открито)
- Потребителите могат да имат множество обяви и покупки

### Субект на обява (`Bambi.Data/Entities/Listing.cs`)
```csharp
public class Listing
{
    public int Id { get; set; }                  // Първичен ключ
    public string Title { get; set; }            // Име на елемент, макс 100 знака
    public string? Description { get; set; }     // Детайли на елемент, макс 1000 знака
    public decimal Price { get; set; }           // DECIMAL(18,2) за валута
    public string Size { get; set; }             // Размер на облекло (XS, S, M, L, XL и т.н.)
    public ConditionLevel Condition { get; set; } // Лошо, добро, като ново, ново
    public bool IsAvailable { get; set; }        // Може ли да се закупи?
    public DateTime CreatedAt { get; set; }      // Когато е списък
    
    // Чужди ключове
    public int SellerId { get; set; }
    public User Seller { get; set; }             // Навигация: кой продава
    
    public int CategoryId { get; set; }
    public Category Category { get; set; }       // Навигация: тип елемент
    
    // Свойства за навигация
    public ICollection<ListingImage> Images { get; set; }    // Всички изображения за обява
    public ICollection<Purchase> Purchases { get; set; }     // Всички поръчки за тази обява
}
```

**Правила на бизнеса:**
- Продавач не може да бъде изтрит, ако има активни обяви (ON DELETE RESTRICT)
- Само налични елементи могат да бъдат закупени
- Поддържа се множество изображения на обява
- Може да има множество покупки

### Субект на покупка (`Bambi.Data/Entities/Purchase.cs`)
```csharp
public enum PurchaseStatus
{
    Pending = 0,
    Confirmed = 1,
    Shipped = 2,
    Delivered = 3
}

public class Purchase
{
    public int Id { get; set; }                  // Първичен ключ
    public decimal PricePaid { get; set; }       // Цена при закупуване
    public string? DeliveryAddress { get; set; } // Адрес за доставка, макс 300 знака
    public PurchaseStatus Status { get; set; }   // Статус на поръчка
    public string? Note { get; set; }            // Бележки на продавач
    public DateTime PurchasedAt { get; set; }    // Когато е поръчана
    
    // Чужди ключове
    public int BuyerId { get; set; }
    public User Buyer { get; set; }              // Навигация: кой купи
    
    public int ListingId { get; set; }
    public Listing Listing { get; set; }         // Навигация: какво е куплено
}
```

**Правила на бизнеса:**
- Купувач не може да бъде изтрит, ако има покупки (ON DELETE RESTRICT)
- Статусът напредва: Pending → Confirmed → Shipped → Delivered
- Цената е заключена при закупуване (исторически запис)

### Изброявания

**ConditionLevel** (Състояние на облекло)
```csharp
enum ConditionLevel {
    Poor = 0,        // Значителна износване, петна, повреда
    Good = 1,        // Нормална износване, все още носима
    LikeNew = 2,     // Минимална износване, отличното състояние
    New = 3          // Никога не е носено, оригиналните тагове
}
```

**UserRole**
```csharp
enum UserRole {
    User = 0,        // Обикновен потребител (купувач/продавач)
    Admin = 2        // Администратор (управление на потребители, модериране на съдържание)
}
```

---

## Слой услуги (Бизнес логика)

### Услуга за удостоверяване (`IAuthService`)

**Отговорности:**
- Регистрация на потребител (регистриране на нови профили)
- Вход на потребител (проверка на удостовереност)
- Генериране на JWT жетон
- Хеширане/проверка на парола

**Ключови методи:**
```csharp
Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
// 1. Проверете дали потребителското име вече съществува → хвърлете ConflictException
// 2. Проверете дали имейлът вече съществува → хвърлете ConflictException
// 3. Хеширане на парола с BCrypt.Net.BCrypt
// 4. Създайте нов субект потребител с Role = User
// 5. Запишете в база данни
// 6. Генерирайте JWT жетон
// 7. Върнете AuthResponseDto (Id, Username, Email, Role, Token)

Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
// 1. Опитайте се да намерите потребител по потребителско име ИЛИ имейл
// 2. Ако не е намерено → хвърлете UnauthorizedException
// 3. Проверете парола с BCrypt
// 4. Генерирайте JWT жетон с претенции (UserId, Username, Role)
// 5. Върнете AuthResponseDto
```

**JWT токен претенции:**
- `sub`: ID на потребител (субект)
- `UserId`: ID на потребител (персонализирано)
- `Username`: Потребителско име
- `name`: Потребителско име (стандартизирано)
- `nameid`: ID на потребител (стандартизирано)
- `role`: Малки букви роля (admin/user)
- `Role`: Малки букви роля (персонализирано, за API)
- `jti`: Уникално ID на жетон

**JWT настройки** (от appsettings.json):
```json
"Jwt": {
    "Secret": "BambiMarketplaceSuperSecretJwtKey1234567890!",
    "Issuer": "BambiAPI",
    "Audience": "BambiClients",
    "ExpiryMinutes": 60
}
```

### Услуга за обяви (`IListingService`)

**Отговорности:**
- Създаване, четене, актуализиране, изтриване на обяви
- Търсене и филтриране на обяви
- Поддръжка на пагинация
- Оразуми (само продавачите могат да редактират своите собствени обяви)

**Ключови методи:**
```csharp
Task<PagedResultDto<ListingDto>> GetAllAsync(
    int? categoryId, string? size, decimal? minPrice, decimal? maxPrice,
    int? condition, bool? isAvailable, string? sortBy, string? sortOrder,
    int page, int pageSize)
// Изгражда сложна SQL заявка с филтри:
// - Филтрирайте по CategoryId, ако е предоставено
// - Филтрирайте по размер (точно съответствие)
// - Филтрирайте по диапазон на цена (minPrice ≤ Price ≤ maxPrice)
// - Филтрирайте по ниво на състояние
// - Филтрирайте по IsAvailable
// - Сортирайте по Title, Price, CreatedAt и т.н.
// - Върнете преглед на резултатите (страница, pageSize)
// - Включете информация за продавач и категория в DTO

Task<ListingDto> GetByIdAsync(int id)
// 1. Заредете обява с изображения и информация за продавач
// 2. Ако не е намерена → хвърлете NotFoundException
// 3. Картографирайте на ListingDto
// 4. Върнете DTO

Task<ListingDto> CreateAsync(int sellerId, CreateListingDto dto)
// 1. Проверете дали категорията съществува
// 2. Създайте субект на обява с:
//    - SellerId = ID на удостовереният потребител
//    - IsAvailable = true
//    - CreatedAt = DateTime.UtcNow
// 3. Валидирайте правила на бизнеса (чрез FluentValidation)
// 4. Запишете в база данни
// 5. Върнете ListingDto

Task<ListingDto> UpdateAsync(int callerId, int id, UpdateListingDto dto)
// 1. Заредете съществуваща обява
// 2. Проверете callerId == SellerId (оразуми)
// 3. Актуализирайте Title, Description, Price, Size, Condition
// 4. Запишете промени
// 5. Върнете актуализирана DTO

Task<void> DeleteAsync(int callerId, int id)
// 1. Заредете обява
// 2. Проверете callerId == SellerId
// 3. Изтрийте обява (изображенията се изтриват в каскада)
// 4. Запишете промени
```

**DTO структура:**
```csharp
// Вход DTO
public class CreateListingDto {
    public string Title { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Size { get; set; }
    public int Condition { get; set; }
    public int CategoryId { get; set; }
}

// Изход DTO
public class ListingDto {
    public int Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Size { get; set; }
    public int Condition { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public int SellerId { get; set; }
    public string SellerUsername { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public List<ListingImageDto> Images { get; set; }
}
```

### Услуга за покупки (`IPurchaseService`)

**Отговорности:**
- Създаване на покупки (купувачи)
- Проследяване на покупки (купувачи/продавачи)
- Актуализиране на статус на покупка
- Проверки на оразумяване

**Ключови методи:**
```csharp
Task<PurchaseDto> CreateAsync(int buyerId, CreatePurchaseDto dto)
// 1. Заредете обява
// 2. Проверете дали обява съществува и IsAvailable = true
// 3. Предотвратете купувача от закупуване на своя обява
// 4. Създайте покупка с:
//    - BuyerId = удостовереният потребител
//    - ListingId = от dto
//    - PricePaid = текуща цена (заключена при закупуване)
//    - Status = Pending
//    - PurchasedAt = DateTime.UtcNow
// 5. Незадължително отметнете обява като недостъпна или позволете множество покупки
// 6. Запишете в база данни
// 7. Върнете PurchaseDto

Task<PagedResultDto<PurchaseDto>> GetMyPurchasesAsync(
    int buyerId, PurchaseStatus? status, DateTime? from, DateTime? to,
    string? sortBy, string? sortOrder, int page, int pageSize)
// Заредете покупки, където BuyerId = buyerId
// Филтрирайте по статус, ако е предоставено
// Филтрирайте по диапазон на дата (от-до), ако е предоставено
// Сортирайте по PurchasedAt, Status и т.н.
// Върнете преглед на резултатите

Task<PagedResultDto<PurchaseDto>> GetMySalesAsync(
    int sellerId, PurchaseStatus? status, DateTime? from, DateTime? to,
    string? sortBy, string? sortOrder, int page, int pageSize)
// Заредете покупки, където Listing.SellerId = sellerId
// (Продажби = покупки на позициите на продавач)
// Филтрирайте и сортирайте като GetMyPurchasesAsync
// Върнете преглед на резултатите

Task<PurchaseDto> UpdateStatusAsync(int callerId, int id, UpdatePurchaseStatusDto dto)
// 1. Заредете покупка
// 2. Проверете callerId == Listing.SellerId (само продавачът може да актуализира статус)
// 3. Актуализирайте Status на dto.Status
// 4. Запишете промени
// 5. Върнете PurchaseDto
```

**Работен поток на статуса:**
```
Pending (0) → Confirmed (1) → Shipped (2) → Delivered (3)
   ↑                                              ↓
   └──────────────── Незадължителен възврат ────────────┘
```

### Услуга за потребители (`IUserService`)

**Отговорности:**
- Управление на профил на потребител
- Търсене/филтриране на потребител (администратор)
- Управление на роли (администратор)
- Актуализирани снимки на профила

**Ключови методи:**
```csharp
Task<PagedResultDto<UserDto>> GetAllAsync(
    string? username, string? city, string? sortBy,
    string? sortOrder, int page, int pageSize)
// Само администратор
// Филтрирайте по потребителско име (частично съответствие), град
// Сортирайте по потребителско име, CreatedAt, град
// Върнете преглед на потребители

Task<UserDto> GetByIdAsync(int id)
// Заредете потребител с брой обяви/покупки
// Върнете UserDto

Task<UserDto> UpdateProfileAsync(int id, UpdateProfileDto dto)
// Актуализирайте описание, номер на телефон, град
// Запишете промени
// Върнете актуализирана DTO

Task<UserDto> UpdateRoleAsync(int id, UpdateRoleDto dto)
// Само администратор
// Промяна на роля на потребител (User ↔ Admin)
// Върнете актуализирана DTO

Task<UserDto> UpdateProfilePictureAsync(
    int id, IFormFile file, IImageStorage imageStorage)
// Качете изображение в Cloudinary
// Съхранете URL и PublicId
// Изтрийте старо изображение, ако съществува
// Запишете промени
// Върнете актуализирана DTO
```

### Услуга за изображения на обяви (`IListingImageService`)

**Отговорности:**
- Качване на изображения в Cloudinary
- Свързване на изображения с обяви
- Изтриване на изображения от Cloudinary

**Ключови методи:**
```csharp
Task<ListingImageDto> UploadAsync(
    int listingId, IFormFile file, IImageStorage storage)
// 1. Проверете дали обява съществува
// 2. Качете файл в Cloudinary (върнете URL и PublicId)
// 3. Създайте субект на ListingImage
// 4. Запишете в база данни
// 5. Върнете ListingImageDto

Task<void> DeleteAsync(int id, IImageStorage storage)
// 1. Заредете изображение
// 2. Изтрийте от Cloudinary с помощта на PublicId
// 3. Изтрийте от база данни
// 4. Запишете промени
```

### Съхранилище на изображения (`IImageStorage`)

**Реализация на CloudinaryImageStorage:**
```csharp
Task<(string Url, string PublicId)> UploadAsync(IFormFile file)
// 1. Инициализирайте клиент на Cloudinary с удостовереност
// 2. Подгответе параметри на качване (папка, формат и т.н.)
// 3. Качете файл
// 4. Върнете URL (за показване) и PublicId (за изтриване)

Task<void> DeleteAsync(string publicId)
// 1. Изтрийте изображение от Cloudinary по PublicId
// 2. Обработете грешки грациозно
```

**Конфигурация на Cloudinary** (от appsettings.json):
```json
"Cloudinary": {
    "CloudName": "dmhcwhutp",
    "ApiKey": "618677611818423",
    "ApiSecret": "zK245lHJSopKvOHgSkL9bAIMUls"
}
```

---

## Слой хранилище (Достъп до данни)

### Модел на хранилище

Всички хранилища реализират интерфейс на `IRepository<T>` базa:
```csharp
public interface IRepository<T>
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
    Task SaveAsync();
}
```

### Хранилище на обяви (`IListingRepository`)

**Ключови методи:**
```csharp
Task<PagedResult<Listing>> GetAllAsync(
    int? categoryId, string? size, decimal? minPrice, decimal? maxPrice,
    int? condition, bool? isAvailable, string? sortBy, string? sortOrder,
    int page, int pageSize)
// Изгражда LINQ заявка: query.Where(...)
// Прилага филтри прогресивно
// Прилага сортиране (OrderBy/OrderByDescending)
// Прилага пагинация (.Skip / .Take)
// Връща PagedResult<Listing> { Items, Total, Page, PageSize }

Task<Listing?> GetByIdAsync(int id, bool includeImages = true)
// Include().ThenInclude() за свързани субекти
// Връща субект с натоварени свойства за навигация

Task<PagedResult<Listing>> GetBySellerAsync(int sellerId, int page, int pageSize)
// Филтрирайте, където SellerId == sellerId
// Върнете преглед на резултатите
```

**Структура на PagedResult:**
```csharp
public class PagedResult<T>
{
    public int Total { get; set; }        // Общи записи, които съответстват на заявката
    public int Page { get; set; }         // Текуща страница
    public int PageSize { get; set; }     // Елементи на страница
    public int Pages => (Total + PageSize - 1) / PageSize;
    public IEnumerable<T> Items { get; set; }
}
```

### Хранилище на потребители (`IUserRepository`)

**Ключови методи:**
```csharp
Task<User?> GetByUsernameAsync(string username)
// Търсене без разлика между главни и малки букви с помощта на .FirstOrAsync()
// Връща null, ако не е намерено

Task<User?> GetByEmailAsync(string email)
// Търсене на имейл без разлика между главни и малки букви

Task<bool> UsernameExistsAsync(string username)
// Бързо проверка при регистрация

Task<bool> EmailExistsAsync(string email)
// Бързо проверка при регистрация

Task<PagedResult<User>> GetAllAsync(
    string? username, string? city, string? sortBy,
    string? sortOrder, int page, int pageSize)
// Администраторско търсене с филтриране
```

### Хранилище на покупки (`IPurchaseRepository`)

**Ключови методи:**
```csharp
Task<PagedResult<Purchase>> GetByBuyerAsync(
    int buyerId, PurchaseStatus? status, DateTime? from,
    DateTime? to, string? sortBy, string? sortOrder,
    int page, int pageSize)
// Филтрирайте, където BuyerId == buyerId
// Незадължителен филтър на статус
// Незадължителен филтър на диапазон на дата
// Върнете преглед на резултатите

Task<PagedResult<Purchase>> GetBySellerAsync(
    int sellerId, PurchaseStatus? status, DateTime? from,
    DateTime? to, string? sortBy, string? sortOrder,
    int page, int pageSize)
// Филтрирайте, където Listing.Seller.Id == sellerId
// Същите опции за филтриране
// Върнете преглед на резултатите
```

---

## Контролери и крайни точки на API

### Контролер за удостоверяване

**Базов път:** `/api/auth`

| Метод | Крайна точка | Проверка | Описание |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Регистриране на нов потребител |
| POST | `/login` | ❌ | Вход (върнете JWT) |

**Заявка за регистрация:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phoneNumber": "+1234567890",
    "city": "New York"
}
```

**Отговор на регистрация (201 Created):**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Заявка за вход:**
```json
{
    "usernameOrEmail": "john_doe",
    "password": "SecurePass123!"
}
```

### Контролер на обяви

**Базов път:** `/api/listings`

| Метод | Крайна точка | Проверка | Описание |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Получете всички обяви (с филтри) |
| GET | `/{id}` | ❌ | Получете детайли на обява |
| GET | `/my` | ✅ | Получете мои обяви (продавач) |
| POST | `/` | ✅ | Създайте нова обява |
| PUT | `/{id}` | ✅ | Актуализирайте обява |
| DELETE | `/{id}` | ✅ | Изтрийте обява |

**Получете всички параметри на заявката за обяви:**
```
GET /api/listings?categoryId=5&minPrice=10&maxPrice=100&size=M&condition=1&page=1&pageSize=10&sortBy=Price&sortOrder=asc
```

- `categoryId`: Филтрирайте по категория
- `size`: Филтрирайте по размер (XS, S, M, L, XL и т.н.)
- `minPrice`, `maxPrice`: Филтър на диапазон на цена
- `condition`: Ниво на състояние (0=Лошо, 1=Добро, 2=Като ново, 3=Ново)
- `isAvailable`: Достъпно ли е за закупуване?
- `sortBy`: Title, Price, CreatedAt, Condition
- `sortOrder`: asc, desc
- `page`: Номер на страница (по подразумение 1)
- `pageSize`: Елементи на страница (по подразумение 10)

**Създайте заявка за обява (POST):**
```json
{
    "title": "Classic Blue Jeans",
    "description": "Lightly worn, perfect condition",
    "price": 35.99,
    "size": "M",
    "condition": 2,
    "categoryId": 1
}
```

### Контролер на покупки

**Базов път:** `/api/purchases`

| Метод | Крайна точка | Проверка | Описание |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Създайте покупка |
| GET | `/my` | ✅ | Получете мои покупки (купувач) |
| GET | `/sales` | ✅ | Получете мои продажби (продавач) |
| GET | `/{id}` | ✅ | Получете детайли на покупка |
| PUT | `/{id}/status` | ✅ | Актуализирайте статус на покупка |

**Създайте заявка за покупка:**
```json
{
    "listingId": 42,
    "deliveryAddress": "123 Main St, New York, NY 10001"
}
```

**Актуализирайте заявка за статус на покупка:**
```json
{
    "status": 2
}
```

**Получете мои параметри на заявката за покупки:**
```
GET /api/purchases/my?status=1&from=2024-01-01&to=2024-12-31&sortBy=PurchasedAt&sortOrder=desc&page=1&pageSize=20
```

### Контролер на потребители

**Базов път:** `/api/users`

| Метод | Крайна точка | Проверка | Описание |
|--------|----------|------|-------------|
| GET | `/` | ✅ (Admin) | Получете всички потребители (администратор) |
| GET | `/{id}` | ✅ | Получете профила на потребител |
| PUT | `/{id}` | ✅ | Актуализирайте профил |
| PUT | `/{id}/role` | ✅ (Admin) | Актуализирайте роля на потребител |
| PUT | `/{id}/picture` | ✅ | Качете снимка на профила |

**Актуализирайте заявка за профил:**
```json
{
    "description": "Vintage fashion enthusiast",
    "phoneNumber": "+1234567890",
    "city": "Los Angeles"
}
```

**Актуализирайте заявка за роля (администратор):**
```json
{
    "role": 2
}
```

### Контролер на изображения на обяви

**Базов път:** `/api/listing-images`

| Метод | Крайна точка | Проверка | Описание |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Качете изображение за обява |
| DELETE | `/{id}` | ✅ | Изтрийте изображение |

**Качете изображение (multipart/form-data):**
```
POST /api/listing-images
Content-Type: multipart/form-data

file: <image_file>
listingId: 42
```

### Контролер на категории

**Базов път:** `/api/categories`

| Метод | Крайна точка | Проверка | Описание |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Получете всички категории |
| GET | `/{id}` | ❌ | Получете детайли на категория |

---

## Конфигурация и средата

### Конфигурация на Program.cs

**Настройка на база данни:**
```csharp
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

**Удостоверяване:**
```csharp
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.NameIdentifier
        };
    });
```

**Конфигурация на CORS:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("BambiCors", policy =>
    {
        if (allowedOrigins.Length == 0)
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        else
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
    });
});
```

**Разрешени произходи** (от appsettings.json):
```json
"Cors": {
    "AllowedOrigins": [
        "http://localhost:5173",   // Сервър за разработка на Vite
        "http://localhost:3000",   // Алтернативен React разработка
        "http://localhost:4200"    // Angular/други рамки
    ]
}
```

**Регистрация на внедряване на зависимости:**
```csharp
// Хранилища
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IListingRepository, ListingRepository>();
builder.Services.AddScoped<IPurchaseRepository, PurchaseRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IListingImageRepository, ListingImageRepository>();

// Услуги
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddScoped<IPurchaseService, PurchaseService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IListingImageService, ListingImageService>();

// Единични
builder.Services.AddSingleton<IImageStorage, CloudinaryImageStorage>();
```

**Регистрация на AutoMapper:**
```csharp
builder.Services.AddAutoMapper(cfg => { }, typeof(MappingProfile).Assembly);
```

**Валидация:**
```csharp
builder.Services
    .AddFluentValidationAutoValidation()
    .AddFluentValidationClientsideAdapters();
```

### Глобална средата за обработка на изключения

**Цел:** Централизирана обработка на грешки, която преобразува изключенията в стандартизирани отговори на RFC 7807 ProblemDetails.

**Картографиране на изключения:**
```csharp
ConflictException         → 409 Conflict
NotFoundException         → 404 Not Found
UnauthorizedException    → 401 Unauthorized
ForbiddenException        → 403 Forbidden
ValidationException      → 422 Unprocessable Entity (с грешки на поле)
Other Exceptions         → 500 Internal Server Error
```

**Формат на отговор на грешка:**
```json
{
    "type": "https://example.com/errors/conflict",
    "title": "Conflict",
    "status": 409,
    "detail": "Username already taken.",
    "instance": "/api/auth/register",
    "errors": {
        "username": ["Username already taken."]
    }
}
```

---

---

## Профили на AutoMapper

**MappingProfile.cs** автоматично картографира:
- `User` → `UserDto`
- `Listing` → `ListingDto`
- `Purchase` → `PurchaseDto`
- `ListingImage` → `ListingImageDto`
- `Category` → `CategoryDto`

Обработва:
- Изравняване на вложени свойства
- Картографиране на стойности на изброяване
- Включване на свързани субекти (продавач, изображения и т.н.)

## Преглед на frontend

### Архитектура

Frontendът е **приложение с една страница (SPA)** построено с React, използвайки:
- **Управление на състояние:** Context API (удостоверяване)
- **Маршрутизиране:** Персонализиран маршрутизатор базиран на хеш (без външна библиотека)
- **HTTP клиент:** Обвивка на Fetch API с JWT удостоверяване
- **UI:** React компоненти с CSS стилизиране

### Структура на директория

```
bambi-web/src/
├── api.js                 # HTTP клиент с обработка на JWT
├── auth-context.jsx       # Контекст на проверка и доставчик
├── router.js              # Помощна програма за маршрутизиране на база хеш
├── App.jsx                # Главен компонент на приложението
├── main.jsx               # Входна точка на React
│
├── Компоненти
├── Страници
├── admin.jsx              # Администраторски панел
├── shop.jsx               # Преглед на обяви
├── listing.jsx            # Детайли на една обява
├── create-edit.jsx        # Форма за създаване/редактиране на обява
├── my-listings.jsx        # Обяви на продавач
├── my-purchases.jsx       # Покупки на купувач
├── my-sales.jsx           # Продажби на продавач (входящи поръчки)
├── user-profile.jsx       # Страница на профила на потребител
│
├── Свързана с удостоверяване
├── login.jsx              # Форма за вход
├── register.jsx           # Форма за регистрация
│
├── Споделени
├── nav.jsx                # Навигационна лента
├── icons.jsx              # Компоненти на икони
├── components.jsx         # Преиспользуеми UI компоненти
├── tweaks-panel.jsx       # Панел за настройки/намесване
│
└── styles.css             # Глобални стилове
```

### Ключови компоненти на frontend

#### **Поток на удостоверяване**
1. **login.jsx** / **register.jsx** → Повикайте `api.auth.register()` или `api.auth.login()`
2. **api.js** → Съхранявайте JWT в `localStorage` и `currentToken` променлива
3. **auth-context.jsx** → Предоставете `useAuth()` хак на компоненти
4. Маршрутите защитени с `<RequireAuth>` компонент

#### **Страница на магазин (shop.jsx)**
1. Заредете обяви: `api.listings.getAll({ филтри })`
2. Показване на обяви с изображения, цена, информация за продавач
3. Филтрирайте по категория, размер, диапазон на цена, състояние
4. Поддръжка на пагинация
5. Щракнете на обява → преглед на детайли (listing.jsx)

#### **Детайли на обява (listing.jsx)**
1. Заредете обява по ID
2. Показване на изображения, описание, информация за продавач
3. Показване на отзивите/оценки (ако е внедрено)
4. Купувачът може да създаде покупка

#### **Създаване/редактиране на обява (create-edit.jsx)**
1. Входни полета на форма: заглавие, описание, цена, размер, състояние, категория
2. Качване на изображения: `api.listings.uploadImage(listingId, file)`
3. Подаване: `api.listings.create(formData)` или `api.listings.update(id, formData)`

#### **Моите обяви (my-listings.jsx)**
1. Заредете обяви на потребител: `api.listings.getMy()`
2. Показване в таблица/мрежа
3. Редактирайте, изтрийте или отметнете като недостъпна
4. Показване на брой покупки/продажби

#### **Управление на покупки**
- **my-purchases.jsx**: Показване на закупени елементи, проследяване на статус
- **my-sales.jsx**: Показване на продадени елементи, актуализиране на статус на поръчка
- Работен поток на статус: Pending → Confirmed → Shipped → Delivered

#### **Навигация (nav.jsx)**
- Връзки: Shop, My Listings, My Purchases, My Sales, Profile, Admin
- Условно показване в зависимост от роля на потребител и статус на проверка
- Лента за търсене (филтриране на обяви)

### HTTP клиент (api.js)

**Обработка на JWT:**
```javascript
// Заредете жетон от localStorage при инициализиране на модул
const stored = localStorage.getItem("bambi_token");
if (stored) currentToken = stored;

// Включете JWT в заглавката за оразуми
const request = async (endpoint, options = {}) => {
    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    // ... направете fetch заявка
};
```

**API методи:**
```javascript
// Проверка
api.auth.register(username, email, password, phone, city)
api.auth.login(usernameOrEmail, password)

// Обяви
api.listings.getAll(filters, page, pageSize)
api.listings.getById(id)
api.listings.getMy(page, pageSize)
api.listings.create(formData)
api.listings.update(id, formData)
api.listings.delete(id)
api.listings.uploadImage(listingId, file)

// Покупки
api.purchases.create(listingId, deliveryAddress)
api.purchases.getMy(status, from, to, page, pageSize)
api.purchases.getMySales(status, from, to, page, pageSize)
api.purchases.getById(id)
api.purchases.updateStatus(id, newStatus)

// Потребители
api.users.getById(id)
api.users.update(id, profileData)
api.users.uploadProfilePicture(id, file)

// Категории
api.categories.getAll()
api.categories.getById(id)
```

### Маршрутизиране (router.js)

**Персонализиран маршрутизатор на база хеш:**
```javascript
// Навигирайте към маршрута
navigate("/shop");  // → window.location.hash = "/shop"
navigate("/listing/42?sort=price");

// Получете текущия маршрут
const route = useHashRoute();  // → { path: "/shop", raw: "/shop?..." }
```

**Текущи маршрути:**
- `/shop` - Преглед на всички обяви
- `/listing/:id` - Преглед на детайли на обява
- `/login` - Страница за вход
- `/register` - Страница за регистрация
- `/my-listings` - Обяви на продавач
- `/my-purchases` - Покупки на купувач
- `/my-sales` - Продажби на продавач
- `/profile/:id` - Профил на потребител
- `/admin` - Администраторски панел

### Управление на състояние

**Контекст на проверка (auth-context.jsx):**
```javascript
// Предоставете useAuth() хак
const { user, token, isAuthenticated, login, logout, updateUser } = useAuth();

// Обект на потребител:
{
    id: 1,
    username: "john_doe",
    email: "john@example.com",
    role: "user" | "admin"
}
```

### Стилизиране (styles.css)

- Глобални стилове (нулиране, типография, цветове)
- Стилове, специфични за компонент (пространство имена класове)
- Адаптивен дизайн за мобилен/таблет/настолен
- Цветна схема: Професионална тема на пазарлак

---

## Инсталация и настройка

### Настройка на Backend

**Предварителни условия:**
- .NET 8 SDK
- SQL Server (или SQL Server Express с LocalDB)
- Visual Studio 2022 или Visual Studio Code

**Стъпки:**

1. **Клониране/отваряне на проект:**
   ```bash
   cd c:\Users\PC100\Desktop\UniProjects\Bambi
   ```

2. **Възстановяване на NuGet пакети:**
   ```bash
   dotnet restore
   ```

3. **Актуализирайте база данни (миграции):**
   ```bash
   cd Bambi.API
   dotnet ef database update
   ```

4. **Запустете API:**
   ```bash
   dotnet run --project Bambi.API
   # API ще бъде достъпен на http://localhost:5138
   ```

5. **Тестирайте API:**
   - Swagger UI: http://localhost:5138/swagger
   - Или използвайте Postman: Импортирайте `bambi-api-openapi.yaml`

**Низ за свързване** (appsettings.json):
```json
"ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=BambiDataBase;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### Настройка на Frontend

**Предварителни условия:**
- Node.js 18+
- npm или yarn

**Стъпки:**

1. **Навигирайте до frontend:**
   ```bash
   cd bambi-web
   ```

2. **Инсталирайте зависимости:**
   ```bash
   npm install
   ```

3. **Стартирайте сервър за разработка:**
   ```bash
   npm run dev
   # Frontend ще бъде достъпен на http://localhost:5173
   ```

4. **Изградете за производство:**
   ```bash
   npm run build
   # Изход в dist/
   ```

5. **Преглед на производство изграждане:**
   ```bash
   npm run preview
   ```

**Конфигурация на Vite (vite.config.js):**
```javascript
// Прокси /api заявките към backend при разработка
server: {
    proxy: {
        '/api': {
            target: 'http://localhost:5138',
            changeOrigin: true
        }
    }
}
```

### Запуск на пълния стек

**Терминал 1 - Backend:**
```bash
cd Bambi.API
dotnet run
# Работи на http://localhost:5138
```

**Терминал 2 - Frontend:**
```bash
cd bambi-web
npm run dev
# Работи на http://localhost:5173
```

**Браузър:**
Отворете http://localhost:5173 за достъп до приложението

---

## Обичайни работни потоци

### Създайте нова обява
1. Потребителят влиза в системата
2. Навигирайте към "Create Listing"
3. Попълнете формата: заглавие, описание, цена, размер, състояние, категория
4. Качете изображения (по избор)
5. Подаване → POST /api/listings
6. Обявата е създадена с IsAvailable = true

### Закупете елемент
1. Потребителят преглеждащ /shop
2. Щракнете на обява → /listing/:id
3. Щракнете на "Buy Now"
4. Въведете адрес на доставка
5. Потвърдете → POST /api/purchases
6. Покупката е създадена със статус = Pending

### Актуализирайте статус на поръчка (продавач)
1. Продавачът навигира към "My Sales"
2. Щракнете на поръчка за преглед на детайли
3. Актуализирайте статус: Pending → Confirmed → Shipped → Delivered
4. PUT /api/purchases/:id/status

### Търсене и филтриране на обяви
1. Потребител на страница /shop
2. Приложете филтри: Категория, размер, диапазон на цена, състояние
3. Сортирайте по: заглавие, цена, дата на създаване
4. Пагинация: Страница 1, 2, 3 и т.н.
5. GET /api/listings?categoryId=5&minPrice=10&maxPrice=100&page=1

---

## Обработка на грешки

### Backend изключения

**Типове персонализирани изключения** (Bambi.Services.Common):
- `ConflictException` → 409 Conflict (например потребителското име е взето)
- `NotFoundException` → 404 Not Found (например обявата не е намерена)
- `UnauthorizedException` → 401 Unauthorized (например невалидна парола)
- `ForbiddenException` → 403 Forbidden (например не може да редактирам обяви на други)

**Валидационни изключения:**
- Грешки на FluentValidation → 422 Unprocessable Entity
- Върнете съобщения на грешка на ниво поле

### Обработка на грешки на Frontend

**Обработка на отговор на API:**
```javascript
try {
    const response = await api.listings.create(formData);
    // Успех
} catch (error) {
    if (error.status === 409) {
        // Conflict - потребителското име/имейл вече е взет
        setError("Username already taken");
    } else if (error.status === 404) {
        // Не е намерено - категорията не съществува
        setError("Category not found");
    } else if (error.status === 422) {
        // Валидационна грешка
        setFieldErrors(error.data.errors);
    }
}
```

---

## Съображения за сигурност

### Сигурност на Backend
- **Пароли:** Хеширана с BCrypt.Net (никога не се съхранява открито)
- **JWT:** Подписан с HS256, изтича в 60 минути
- **CORS:** Ограничено до разрешени произходи
- **Оразуми:** [Authorize] атрибути на защитени крайни точки
- **Оразуми базирани на роля:** Крайни точки само за администратор изискват твърдение за роля
- **Валидация на входни данни:** FluentValidation на всички DTOs
- **Обработка на изключения:** Безопасни съобщения за грешки (без проследявания на стека към клиент)

### Сигурност на Frontend
- **Съхранилище на жетон:** localStorage (разгледайте HttpOnly бисквитки за производство)
- **HTTPS:** Насилено в производство (appsettings.Development.json има RequireHttpsMetadata = false за разработка)
- **Предотвратяване на XSS:** React автоматично екранира съдържание
- **Защита на CSRF:** Политика за SameSite бисквитка (имплицитна при JWT Bearer удостоверяване)

---

## Оптимизирания на производителност

### База данни
- **Индекси:** Потребителско име, имейл (потребители), име (категории)
- **Пагинация:** По подразумение 10-20 елементи на страница
- **Лениво зареждане:** Свързаните субекти се зареждат само когато е необходимо

### API
- **Кеширане:** В момента не е внедрено (може да се кеша категориите)
- **Компресия:** GZIP е активиран в средата
- **Async/Await:** Всички операции I/O са асинхронни

### Frontend
- **Разделяне на код:** Не е конфигурирано (може да се използва React.lazy за маршрути)
- **Оптимизиране на изображения:** Cloudinary обработва доставка и оптимизиране на CDN
- **Размер на пакет:** Vite обработва tree-shaking и намаляване

---

## Бъдещи подобрения

1. **Търсене:** Търсене на пълен текст, запазени търсения, история на търсене
2. **Оценки и отзивки:** Оценки на потребител, отзивови за обяви
3. **Съобщения:** Частно съобщение между купувачи/продавачи
4. **Списъци със желанията:** Запазване на любими обяви
5. **Препоръки:** Препоръка на база ML двигател
6. **Плащания:** Интеграция със Stripe/PayPal
7. **Известия:** Известия по имейл/SMS/push
8. **Аналитика:** Администраторски панел за продажба аналитика
9. **Мобилно приложение:** Версия на React Native
10. **Real-time:** WebSocket за живи известия/чат

---

## Контакт и поддръжка

За въпроси или проблеми се свържете с отбора за разработка или създайте проблем в хранилището на проекта.

**Корен на проект:** `c:\Users\PC100\Desktop\UniProjects\Bambi`

---

**Документация генерирана:** 25 май 2026 г.  
**Версия:** 1.0  
**Статус:** Пълна
