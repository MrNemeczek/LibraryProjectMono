# Dokumentacja projektu - LibraryProject

## 1. Temat projektu

Tematem projektu jest system biblioteczny wspierajacy obsluge katalogu ksiazek, rezerwacji, wypozyczen oraz zwrotow. System sklada sie z aplikacji webowej dla uzytkownikow oraz backendowego API odpowiedzialnego za logike biznesowa, autoryzacje i zapis danych w bazie SQL Server.

Projekt zostal przygotowany w wariancie projektowo-implementacyjnym. Repozytorium zawiera kod backendu, frontend, migracje bazy danych, konfiguracje Docker Compose dla SQL Server oraz testy jednostkowe.

## 2. Cel systemu

Celem systemu jest usprawnienie pracy biblioteki przez udostepnienie cyfrowego katalogu ksiazek oraz mechanizmow zarzadzania rezerwacjami i wypozyczeniami. Aplikacja pozwala czytelnikom przegladac katalog, rezerwowac dostepne ksiazki i sprawdzac swoje wypozyczenia, a bibliotekarzom zarzadzac zasobami biblioteki oraz realizowac obsluge wypozyczen.

System rozwiazuje nastepujace problemy:

- brak jednego miejsca do przegladania katalogu bibliotecznego,
- reczna obsluga rezerwacji i wypozyczen,
- trudnosc w kontroli dostepnosci egzemplarzy,
- potrzeba rozdzielenia uprawnien czytelnika, bibliotekarza i administratora,
- koniecznosc utrzymywania historii rezerwacji oraz wypozyczen.

## 3. Zakres funkcjonalny

System obejmuje:

- rejestracje i logowanie uzytkownikow,
- autoryzacje z uzyciem tokenow JWT,
- obsluge rol: `Reader`, `Librarian`, `Administrator`,
- przegladanie katalogu ksiazek,
- filtrowanie ksiazek po tytule, autorze i kategorii,
- podglad szczegolow ksiazki oraz jej egzemplarzy,
- dodawanie, edycje i usuwanie ksiazek przez bibliotekarza lub administratora,
- automatyczne tworzenie kategorii przy dodawaniu ksiazki,
- rezerwowanie ksiazek przez zalogowanych uzytkownikow,
- anulowanie wlasnych rezerwacji,
- przegladanie wlasnych rezerwacji i wypozyczen,
- przegladanie wszystkich rezerwacji i wypozyczen przez bibliotekarza lub administratora,
- realizacje rezerwacji przez bibliotekarza lub administratora,
- zwrot wypozyczonej ksiazki,
- przechowywanie danych w bazie SQL Server,
- testowanie logiki biznesowej i komponentow frontendu.

## 4. Aktorzy systemu

| Aktor | Opis | Przykladowe uprawnienia |
| --- | --- | --- |
| Czytelnik | Standardowy uzytkownik systemu. | Rejestracja, logowanie, przegladanie katalogu, rezerwacja ksiazek, anulowanie wlasnych rezerwacji, podglad swoich wypozyczen. |
| Bibliotekarz | Pracownik biblioteki obslugujacy zasoby i proces wypozyczen. | Zarzadzanie ksiazkami, przeglad wszystkich rezerwacji, realizacja rezerwacji, przeglad wszystkich wypozyczen, zwrot ksiazki. |
| Administrator | Uzytkownik techniczny lub zarzadzajacy systemem. | Uprawnienia analogiczne do bibliotekarza w zakresie funkcji administracyjnych dostepnych w aplikacji. |

## 5. Wymagania funkcjonalne

| Id | Wymaganie |
| --- | --- |
| WF-01 | System umozliwia rejestracje nowego uzytkownika jako czytelnika. |
| WF-02 | System umozliwia logowanie uzytkownika przy pomocy adresu e-mail i hasla. |
| WF-03 | System generuje token JWT po poprawnym logowaniu. |
| WF-04 | System przechowuje informacje o aktualnym uzytkowniku po stronie frontendu. |
| WF-05 | System blokuje dostep do chronionych tras dla niezalogowanych uzytkownikow. |
| WF-06 | System ogranicza funkcje bibliotekarskie do rol `Librarian` i `Administrator`. |
| WF-07 | System umozliwia przegladanie listy ksiazek z paginacja. |
| WF-08 | System umozliwia filtrowanie ksiazek po tytule, autorze i kategorii. |
| WF-09 | System umozliwia podglad szczegolow ksiazki. |
| WF-10 | System umozliwia dodanie ksiazki wraz z numerami inwentarzowymi egzemplarzy. |
| WF-11 | System umozliwia edycje danych ksiazki oraz dodawanie nowych egzemplarzy. |
| WF-12 | System umozliwia logiczne usuniecie ksiazki. |
| WF-13 | System kontroluje unikalnosc numeru ISBN aktywnej ksiazki. |
| WF-14 | System kontroluje unikalnosc numeru inwentarzowego egzemplarza. |
| WF-15 | System umozliwia utworzenie rezerwacji na dostepna ksiazke. |
| WF-16 | System blokuje utworzenie drugiej aktywnej rezerwacji tego samego uzytkownika na te sama ksiazke. |
| WF-17 | System zmienia status egzemplarza na `Reserved` po utworzeniu rezerwacji. |
| WF-18 | System umozliwia czytelnikowi anulowanie wlasnej rezerwacji. |
| WF-19 | System przywraca dostepnosc egzemplarza po anulowaniu rezerwacji. |
| WF-20 | System umozliwia bibliotekarzowi realizacje rezerwacji. |
| WF-21 | System tworzy wypozyczenie po realizacji rezerwacji. |
| WF-22 | System zmienia status egzemplarza na `Borrowed` po wypozyczeniu. |
| WF-23 | System umozliwia zwrot wypozyczonej ksiazki. |
| WF-24 | System zmienia status wypozyczenia na `Returned` i przywraca dostepnosc egzemplarza po zwrocie. |
| WF-25 | System udostepnia endpointy do pobierania wlasnych oraz wszystkich rezerwacji i wypozyczen zgodnie z rola uzytkownika. |

## 6. Wymagania niefunkcjonalne

| Id | Wymaganie |
| --- | --- |
| WN-01 | Backend powinien byc zbudowany w architekturze warstwowej. |
| WN-02 | System powinien wykorzystywac relacyjna baze danych SQL Server. |
| WN-03 | Dostep do chronionych operacji powinien byc zabezpieczony autoryzacja JWT. |
| WN-04 | Hasla uzytkownikow powinny byc przechowywane w postaci hasha. |
| WN-05 | Logika biznesowa powinna byc testowalna jednostkowo bez uruchamiania API i bazy danych. |
| WN-06 | Frontend powinien byc aplikacja SPA dostepna przez przegladarke. |
| WN-07 | API powinno udostepniac dokumentacje OpenAPI/Scalar w srodowisku deweloperskim. |
| WN-08 | System powinien obslugiwac bledy domenowe i aplikacyjne w sposob spojny. |
| WN-09 | Dane powinny byc walidowane po stronie domeny i logiki aplikacyjnej. |
| WN-10 | Uruchomienie bazy danych powinno byc mozliwe przez Docker Compose. |
| WN-11 | System powinien stosowac paginacje na listach ksiazek, rezerwacji i wypozyczen. |
| WN-12 | Kod powinien byc podzielony na projekty odpowiedzialne za API, aplikacje, domene i infrastrukture. |

## 7. Diagram przypadkow uzycia

Diagram przypadkow uzycia znajduje sie w pliku:

```text
docs/diagrams/use-case.mmd
```

Najwazniejsze przypadki uzycia:

- rejestracja i logowanie,
- przegladanie katalogu,
- rezerwacja ksiazki,
- anulowanie rezerwacji,
- przeglad wypozyczen,
- zarzadzanie ksiazkami,
- realizacja rezerwacji,
- zwrot ksiazki.

## 8. Opis scenariuszy uzycia

### 8.1. Rejestracja uzytkownika

1. Uzytkownik otwiera formularz rejestracji.
2. Wprowadza imie, nazwisko, e-mail i haslo.
3. Frontend wysyla zadanie `POST /api/auth/register`.
4. Backend normalizuje adres e-mail i sprawdza jego unikalnosc.
5. System tworzy uzytkownika z rola `Reader`.
6. Haslo jest hashowane.
7. Dane uzytkownika sa zapisywane w bazie.
8. API zwraca dane uwierzytelnienia.

### 8.2. Logowanie

1. Uzytkownik podaje e-mail i haslo.
2. Frontend wysyla zadanie `POST /api/auth/login`.
3. Backend pobiera uzytkownika po e-mailu.
4. System sprawdza aktywnosc konta i poprawnosc hasla.
5. Po poprawnej weryfikacji generowany jest token JWT.
6. Frontend zapisuje token i dane uzytkownika w `localStorage`.
7. Kolejne zadania do API otrzymuja naglowek `Authorization: Bearer ...`.

### 8.3. Rezerwacja ksiazki

1. Czytelnik wybiera ksiazke z katalogu.
2. Frontend wysyla zadanie `POST /api/reservations`.
3. Backend identyfikuje uzytkownika na podstawie tokena JWT.
4. System sprawdza, czy ksiazka istnieje.
5. System sprawdza, czy uzytkownik nie ma aktywnej rezerwacji tej samej ksiazki.
6. System wyszukuje dostepny egzemplarz.
7. Tworzona jest rezerwacja ze statusem `Active`.
8. Egzemplarz otrzymuje status `Reserved`.
9. Dane sa zapisywane w bazie.

### 8.4. Realizacja rezerwacji

1. Bibliotekarz otwiera liste wszystkich rezerwacji.
2. Wybiera aktywna rezerwacje do realizacji.
3. Frontend wysyla zadanie `PUT /api/reservations/{id}/fulfill`.
4. Backend pobiera rezerwacje i dostepny egzemplarz ksiazki.
5. Rezerwacja otrzymuje status `Fulfilled`.
6. Egzemplarz otrzymuje status `Borrowed`.
7. System tworzy wypozyczenie powiazane z rezerwacja.
8. Dane sa zapisywane w bazie.

### 8.5. Zwrot ksiazki

1. Bibliotekarz otwiera liste wypozyczen.
2. Wybiera aktywne wypozyczenie do zwrotu.
3. Frontend wysyla zadanie `PUT /api/loans/{id}/return`.
4. Backend sprawdza wypozyczenie i uprawnienia uzytkownika.
5. Wypozyczenie otrzymuje status `Returned` oraz date zwrotu.
6. Egzemplarz wraca do statusu `Available`.
7. Dane sa zapisywane w bazie.

## 9. Architektura systemu

System ma architekture wielowarstwowa. Diagram architektury znajduje sie w pliku:

```text
docs/diagrams/architecture.mmd
```

### 9.1. Warstwa prezentacji

Warstwa prezentacji znajduje sie w projekcie `LibraryProjectFe`. Jest to aplikacja Angular 21 korzystajaca z PrimeNG, RxJS i mechanizmow Angular Router.

Odpowiedzialnosci warstwy prezentacji:

- wyswietlanie formularzy logowania i rejestracji,
- prezentacja katalogu ksiazek,
- prezentacja szczegolow ksiazki,
- obsluga formularza tworzenia i edycji ksiazki,
- prezentacja list rezerwacji i wypozyczen,
- wysylanie zadan HTTP do backendu,
- przechowywanie tokena JWT po stronie klienta,
- ograniczanie dostepu do tras za pomoca `authGuard` i `roleGuard`.

Najwazniejsze elementy:

- `AuthService` - logowanie, rejestracja, odczyt tokena i aktualnego uzytkownika,
- `BookService` - komunikacja z endpointami ksiazek i kategorii,
- `ReservationService` - komunikacja z endpointami rezerwacji,
- `LoanService` - komunikacja z endpointami wypozyczen,
- `AuthInterceptor` - dodawanie tokena JWT do zadan HTTP,
- komponenty `book-list`, `book-detail`, `book-form`, `my-reservations`, `all-reservations`, `my-loans`, `all-loans`.

### 9.2. Warstwa API

Warstwa API znajduje sie w projekcie `LibraryProject.Api`. Udostepnia kontrolery REST:

- `AuthController`,
- `BooksController`,
- `CategoriesController`,
- `ReservationsController`,
- `LoansController`.

Odpowiedzialnosci warstwy API:

- przyjmowanie zadan HTTP,
- mapowanie parametrow z tras i query string,
- pobieranie identyfikatora i roli uzytkownika z tokena,
- stosowanie atrybutow `Authorize`,
- zwracanie odpowiednich kodow HTTP,
- obsluga dokumentacji OpenAPI/Scalar,
- przekazywanie pracy do serwisow aplikacyjnych.

### 9.3. Warstwa logiki biznesowej

Warstwa logiki biznesowej znajduje sie w projekcie `LibraryProject.Application`.

Najwazniejsze serwisy:

- `AuthenticationService`,
- `BookService`,
- `CategoryService`,
- `ReservationService`,
- `LoanService`.

Odpowiedzialnosci:

- realizacja przypadkow uzycia,
- walidacja regul biznesowych,
- kontrola uprawnien na poziomie przypadkow uzycia,
- komunikacja z repozytoriami przez interfejsy,
- tworzenie odpowiedzi DTO,
- zarzadzanie transakcja przez `IUnitOfWork`.

### 9.4. Warstwa domenowa

Warstwa domenowa znajduje sie w projekcie `LibraryProject.Domain`. Zawiera encje, enumy, value object oraz reguly domenowe.

Glowne encje:

- `User`,
- `Book`,
- `BookCopy`,
- `Category`,
- `Reservation`,
- `Loan`.

Przykladowe reguly domenowe:

- ksiazka wymaga tytulu, autora, ISBN i kategorii,
- numer ISBN jest reprezentowany przez value object `Isbn`,
- egzemplarz mozna zarezerwowac tylko, gdy ma status `Available`,
- egzemplarz mozna wypozyczyc tylko, gdy ma status `Available`,
- rezerwacje mozna anulowac, zrealizowac lub wygasic tylko wtedy, gdy jest aktywna,
- wypozyczenia nie mozna zwrocic dwa razy.

### 9.5. Warstwa infrastruktury i danych

Warstwa infrastruktury znajduje sie w projekcie `LibraryProject.Infrastructure`.

Odpowiedzialnosci:

- konfiguracja `LibraryDbContext`,
- implementacja repozytoriow,
- konfiguracja encji EF Core,
- obsluga migracji,
- polaczenie z SQL Server,
- hashowanie hasel,
- generowanie tokenow JWT.

## 10. Diagram klas

Diagram klas znajduje sie w pliku:

```text
docs/diagrams/class-diagram.mmd
```

Diagram pokazuje encje domenowe, ich najwazniejsze pola, metody domenowe oraz relacje miedzy uzytkownikami, ksiazkami, egzemplarzami, rezerwacjami i wypozyczeniami.

## 11. Projekt bazy danych

Diagram bazy danych znajduje sie w pliku:

```text
docs/diagrams/database.mmd
```

System korzysta z bazy SQL Server oraz Entity Framework Core. Kontekst bazy danych `LibraryDbContext` zawiera zbiory:

- `Users`,
- `Categories`,
- `Books`,
- `BookCopies`,
- `Reservations`,
- `Loans`.

### 11.1. Najwazniejsze tabele

| Tabela | Przeznaczenie |
| --- | --- |
| `Users` | Dane uzytkownikow, role, status aktywnosci i hash hasla. |
| `Categories` | Kategorie ksiazek. |
| `Books` | Dane bibliograficzne ksiazek. |
| `BookCopies` | Fizyczne egzemplarze ksiazek z numerem inwentarzowym i statusem. |
| `Reservations` | Rezerwacje czytelnikow. |
| `Loans` | Wypozyczenia egzemplarzy. |

### 11.2. Relacje

| Relacja | Opis |
| --- | --- |
| `Categories 1..* Books` | Jedna kategoria moze obejmowac wiele ksiazek. |
| `Books 1..* BookCopies` | Jedna ksiazka moze miec wiele egzemplarzy. |
| `Users 1..* Reservations` | Jeden uzytkownik moze utworzyc wiele rezerwacji. |
| `Books 1..* Reservations` | Jedna ksiazka moze byc rezerwowana wiele razy. |
| `Users 1..* Loans` | Jeden uzytkownik moze miec wiele wypozyczen. |
| `BookCopies 1..* Loans` | Jeden egzemplarz moze wystepowac w wielu historycznych wypozyczeniach. |
| `Reservations 0..1 Loans` | Zrealizowana rezerwacja moze miec powiazane wypozyczenie. |

### 11.3. Ograniczenia i indeksy

W konfiguracji EF Core zastosowano m.in.:

- unikalny indeks na `Users.Email`,
- unikalny indeks na `Categories.Name`,
- unikalny indeks na `Books.Isbn` dla aktywnych ksiazek,
- unikalny indeks na `BookCopies.InventoryNumber`,
- indeksy wspierajace filtrowanie po statusach rezerwacji i wypozyczen,
- globalny filtr `Books`, ktory ukrywa ksiazki logicznie usuniete,
- ograniczenia dlugosci pol tekstowych.

## 12. Reguly biznesowe

| Obszar | Regula |
| --- | --- |
| Uzytkownicy | Nowy uzytkownik otrzymuje role `Reader`. |
| Uzytkownicy | Adres e-mail musi byc unikalny. |
| Uzytkownicy | Logowanie jest mozliwe tylko dla aktywnego konta. |
| Ksiazki | ISBN aktywnej ksiazki musi byc unikalny. |
| Ksiazki | Ksiazka jest usuwana logicznie przez `IsDeleted` i `DeletedAt`. |
| Egzemplarze | Numer inwentarzowy egzemplarza musi byc unikalny globalnie. |
| Egzemplarze | Tylko egzemplarz `Available` moze zostac zarezerwowany lub wypozyczony. |
| Rezerwacje | Uzytkownik nie moze miec dwoch aktywnych rezerwacji tej samej ksiazki. |
| Rezerwacje | Domyslny termin odbioru wynosi 3 dni, maksymalny 7 dni. |
| Rezerwacje | Anulowanie rezerwacji przywraca egzemplarz do statusu `Available`. |
| Wypozyczenia | Realizacja rezerwacji tworzy wypozyczenie. |
| Wypozyczenia | Zwrot wypozyczenia ustawia date zwrotu i status `Returned`. |
| Wypozyczenia | Zwrot egzemplarza przywraca status `Available`. |

## 13. Komunikacja pomiedzy warstwami

Przeplyw typowego zadania:

1. Uzytkownik wykonuje akcje w aplikacji Angular.
2. Komponent wywoluje odpowiedni serwis frontendu.
3. Serwis frontendu wysyla zadanie HTTP do endpointu `/api/...`.
4. `AuthInterceptor` dodaje token JWT, jezeli endpoint wymaga autoryzacji.
5. Kontroler API odbiera zadanie i przekazuje je do serwisu aplikacyjnego.
6. Serwis aplikacyjny wykonuje logike biznesowa i korzysta z repozytoriow.
7. Repozytorium komunikuje sie z baza przez Entity Framework Core.
8. `IUnitOfWork.SaveChangesAsync` zapisuje zmiany.
9. API zwraca odpowiedz DTO do frontendu.
10. Frontend aktualizuje widok.

Przeplyw rezerwacji zostal pokazany w pliku:

```text
docs/diagrams/reservation-flow.mmd
```

## 14. API systemu

### 14.1. Autoryzacja

| Metoda | Endpoint | Opis | Dostep |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Rejestracja uzytkownika. | Publiczny |
| `POST` | `/api/auth/login` | Logowanie i pobranie tokena JWT. | Publiczny |

### 14.2. Ksiazki i kategorie

| Metoda | Endpoint | Opis | Dostep |
| --- | --- | --- | --- |
| `GET` | `/api/books` | Lista ksiazek z paginacja i filtrami. | Publiczny w API, w UI trasa chroniona |
| `GET` | `/api/books/{id}` | Szczegoly ksiazki. | Publiczny w API, w UI trasa chroniona |
| `POST` | `/api/books` | Dodanie ksiazki. | `Librarian`, `Administrator` |
| `PUT` | `/api/books/{id}` | Edycja ksiazki. | `Librarian`, `Administrator` |
| `DELETE` | `/api/books/{id}` | Logiczne usuniecie ksiazki. | `Librarian`, `Administrator` |
| `GET` | `/api/categories` | Lista kategorii. | Publiczny |

### 14.3. Rezerwacje

| Metoda | Endpoint | Opis | Dostep |
| --- | --- | --- | --- |
| `GET` | `/api/reservations` | Wlasne rezerwacje. | Zalogowany uzytkownik |
| `GET` | `/api/reservations/{id}` | Szczegoly rezerwacji. | Wlasciciel, bibliotekarz lub administrator |
| `GET` | `/api/reservations/all` | Wszystkie rezerwacje. | `Librarian`, `Administrator` |
| `POST` | `/api/reservations` | Utworzenie rezerwacji. | Zalogowany uzytkownik |
| `PUT` | `/api/reservations/{id}/cancel` | Anulowanie rezerwacji. | Wlasciciel rezerwacji |
| `PUT` | `/api/reservations/{id}/fulfill` | Realizacja rezerwacji. | `Librarian`, `Administrator` |

### 14.4. Wypozyczenia

| Metoda | Endpoint | Opis | Dostep |
| --- | --- | --- | --- |
| `GET` | `/api/loans` | Wlasne wypozyczenia. | Zalogowany uzytkownik |
| `GET` | `/api/loans/{id}` | Szczegoly wypozyczenia. | Wlasciciel, bibliotekarz lub administrator |
| `GET` | `/api/loans/all` | Wszystkie wypozyczenia. | `Librarian`, `Administrator` |
| `PUT` | `/api/loans/{id}/return` | Zwrot ksiazki. | `Librarian`, `Administrator` |

## 15. Projekt warstwy prezentacji

Aplikacja frontendowa jest podzielona na komponenty odpowiadajace glownym obszarom systemu.

| Obszar | Komponenty |
| --- | --- |
| Autoryzacja | `login`, `register` |
| Nawigacja | `navbar` |
| Ksiazki | `book-list`, `book-detail`, `book-form` |
| Rezerwacje | `my-reservations`, `all-reservations` |
| Wypozyczenia | `my-loans`, `all-loans` |

Trasy aplikacji:

- `/login`,
- `/register`,
- `/books`,
- `/books/new`,
- `/books/:id`,
- `/books/:id/edit`,
- `/reservations`,
- `/reservations/all`,
- `/loans`,
- `/loans/all`.

Trasy wymagajace logowania sa zabezpieczone przez `authGuard`. Trasy administracyjne i bibliotekarskie sa zabezpieczone przez `roleGuard(['Librarian', 'Administrator'])`.

## 16. Technologie

### 16.1. Backend

| Technologia | Zastosowanie |
| --- | --- |
| `.NET 10` | Platforma backendu. |
| `ASP.NET Core` | REST API i kontrolery. |
| `Entity Framework Core` | ORM i migracje bazy danych. |
| `SQL Server` | Relacyjna baza danych. |
| `JWT Bearer` | Uwierzytelnianie i autoryzacja. |
| `Scalar / OpenAPI` | Dokumentacja API w srodowisku deweloperskim. |
| `xUnit` | Testy jednostkowe backendu. |
| `FluentAssertions` | Czytelne asercje w testach. |
| `NSubstitute` | Mockowanie zaleznosci. |
| `AutoFixture` | Generowanie danych testowych. |

### 16.2. Frontend

| Technologia | Zastosowanie |
| --- | --- |
| `Angular 21` | Aplikacja SPA. |
| `TypeScript` | Jezyk implementacji frontendu. |
| `PrimeNG` | Komponenty UI. |
| `RxJS` | Obsluga strumieni i odpowiedzi HTTP. |
| `Vitest` | Testy jednostkowe frontendu. |
| `Prettier` | Formatowanie kodu. |

### 16.3. Infrastruktura

| Technologia | Zastosowanie |
| --- | --- |
| `Docker Compose` | Uruchomienie całego środowiska: SQL Server, backend API, frontend SPA. |
| `Dockerfile` | Budowa obrazów backendu (.NET) i frontendu (Angular/Nginx). |
| `SQL Server 2022` | Silnik bazy danych. |
| `Angular proxy` | Przekierowanie `/api` do backendu lokalnego przy uruchomieniu deweloperskim. |

## 17. Konfiguracja i uruchomienie

### 17.1. Uruchomienie przez Docker Compose

Glowny plik `docker-compose.yml` w katalogu glownym projektu uruchamia calosc srodowiska:

| Usluga | Kontener | Port |
| --- | --- | --- |
| SQL Server 2022 | `libraryproject-sqlserver` | 1433 |
| Backend (.NET) | `libraryproject-backend` | 5156 |
| Frontend (Angular/Nginx) | `libraryproject-frontend` | 80 |

```bash
docker compose up -d
```

Backend automatycznie aplikuje migracje EF Core przy starcie przez mechanizm `app.ApplyMigrations()`.

Domyslna baza danych: `LibraryProjectDb`.

### 17.2. Backend

Przykladowe uruchomienie backendu:

```bash
dotnet run --project LibraryProjectBe/src/LibraryProject.Api/LibraryProject.Api.csproj
```

W srodowisku deweloperskim dostepna jest dokumentacja OpenAPI/Scalar.

### 17.3. Frontend

Przykladowe uruchomienie frontendu:

```bash
cd LibraryProjectFe
npm install
npm start
```

Proxy frontendu przekierowuje `/api` na:

```text
https://localhost:7261
```

### 17.4. Uruchomienie deweloperskie (bez Docker)

W trybie deweloperskim backend i frontend uruchamia sie osobno, a baza danych (SQL Server) moze byc uruchomiona przez Docker Compose:

1. Uruchom baze danych:
   ```bash
   docker compose up sqlserver -d
   ```

2. Uruchom backend:
   ```bash
   dotnet run --project LibraryProjectBe/src/LibraryProject.Api/LibraryProject.Api.csproj
   ```

   Backend bedzie dostepny na `https://localhost:7261` (lub `http://localhost:5156`).

3. Uruchom frontend:
   ```bash
   cd LibraryProjectFe
   npm install
   npm start
   ```

   Frontend bedzie dostepny na `http://localhost:4200`.

Proxy Angulara (`/api`) przekierowuje zadania na `https://localhost:7261`.

## 18. Testowanie

### 18.1. Testy backendu

Backend posiada testy jednostkowe w projekcie `LibraryProject.Application.Tests`.

Zakres testow obejmuje m.in.:

- logike `AuthenticationService`,
- logike `BookService`,
- logike `ReservationService`,
- logike `LoanService`,
- encje domenowe `Book`, `BookCopy`, `Reservation`, `Loan`, `Category`,
- value object `Isbn`,
- mechanizmy `Guard` i `DomainOperation`.

Przykladowe uruchomienie:

```bash
dotnet test LibraryProjectBe/tests/LibraryProject.Application.Tests/LibraryProject.Application.Tests.csproj
```

### 18.2. Testy frontendu

Frontend posiada testy komponentow, guardow i serwisow w plikach `*.spec.ts`.

Zakres testow obejmuje m.in.:

- komponent logowania,
- komponent rejestracji,
- nawigacje,
- liste ksiazek,
- formularz ksiazki,
- szczegoly ksiazki,
- rezerwacje,
- wypozyczenia,
- `authGuard`,
- `roleGuard`,
- `AuthService`.

Przykladowe uruchomienie:

```bash
cd LibraryProjectFe
npm test
```

### 18.3. Proponowane testy manualne

| Scenariusz | Oczekiwany rezultat |
| --- | --- |
| Rejestracja nowego uzytkownika | Konto zostaje utworzone z rola `Reader`. |
| Logowanie poprawnymi danymi | Token JWT zostaje zapisany w aplikacji. |
| Wejscie na chroniona trase bez tokena | Uzytkownik zostaje przekierowany do `/login`. |
| Dodanie ksiazki przez bibliotekarza | Ksiazka i egzemplarze zostaja zapisane w bazie. |
| Dodanie ksiazki z istniejacym ISBN | System zwraca blad biznesowy. |
| Rezerwacja dostepnej ksiazki | Powstaje rezerwacja, egzemplarz ma status `Reserved`. |
| Anulowanie rezerwacji | Rezerwacja ma status `Cancelled`, egzemplarz wraca do `Available`. |
| Realizacja rezerwacji | Powstaje wypozyczenie, egzemplarz ma status `Borrowed`. |
| Zwrot ksiazki | Wypozyczenie ma status `Returned`, egzemplarz wraca do `Available`. |

## 19. Ograniczenia technologiczne i organizacyjne

- System jest przygotowany jako aplikacja lokalna z frontendem na `localhost:4200` i backendem na `https://localhost:7261`.
- Baza danych jest uruchamiana lokalnie w kontenerze SQL Server.
- W repozytorium znajduje sie glowny plik `docker-compose.yml` uruchamiajacy SQL Server, backend API oraz frontend SPA z uzyciem Dockerfile dla backendu i frontendu.
- Role uzytkownikow sa obslugiwane przez backend i frontend, ale interfejs zarzadzania uzytkownikami nie jest wydzielony jako osobny modul.
- Projekt skupia sie na podstawowym procesie bibliotecznym: katalog, rezerwacje, wypozyczenia i zwroty.

## 20. Komplet elementow wymaganych po zjazdach

### Zjazd 1 - analiza problemu i wymagania

| Element | Status |
| --- | --- |
| Temat projektu | Gotowe |
| Opis problemu i celu systemu | Gotowe |
| Identyfikacja aktorow | Gotowe |
| Wymagania funkcjonalne | Gotowe |
| Wymagania niefunkcjonalne | Gotowe |

### Zjazd 2 - UML i architektura warstwowa

| Element | Status |
| --- | --- |
| Diagram przypadkow uzycia | `docs/diagrams/use-case.mmd` |
| Opis scenariuszy uzycia | Gotowe |
| Diagram klas | `docs/diagrams/class-diagram.mmd` |
| Architektura wielowarstwowa | `docs/diagrams/architecture.mmd` i opis w dokumentacji |
| Lista technologii | Gotowe |

### Zjazd 3 - projekt techniczny i realizacja

| Element | Status |
| --- | --- |
| Projekt logiki biznesowej | Gotowe |
| Reguly biznesowe | Gotowe |
| Projekt bazy danych | `docs/diagrams/database.mmd` i opis w dokumentacji |
| Komunikacja pomiedzy warstwami | Gotowe |
| Opis testowania | Gotowe |
| Implementacja | Obecna w `LibraryProjectBe` i `LibraryProjectFe` |

### Zjazd 4 - finalizacja i prezentacja

| Element | Status |
| --- | --- |
| Kompletna dokumentacja | Ten plik Markdown oraz diagramy Mermaid |
| Kod zrodlowy | Obecny w projekcie |
| Pliki bazy danych | Migracje EF Core oraz Docker Compose dla SQL Server |
| Testy jednostkowe | Obecne dla backendu i frontendu |
| Docker Compose | `docker-compose.yml` (glowny, 3 uslugi) |

## 21. Podsumowanie

LibraryProject jest kompletnym projektem systemu bibliotecznego z podzialem na frontend, API, logike aplikacyjna, domene i infrastrukture danych. System implementuje najwazniejsze procesy biblioteczne: zarzadzanie katalogiem, rezerwacje, wypozyczenia i zwroty. Projekt zawiera mechanizmy autoryzacji JWT, role uzytkownikow, walidacje domenowa, migracje bazy danych oraz testy jednostkowe.
