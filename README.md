# MonkeCasino

---
ten plik na koniec sie znieni, ale teraz w nim opisze co gdzie klepiemy 

foldery: 
* config: konfiguracja aplikacji np. połączenie z mongoDB, konfiguracja socket.io ...
* controllers: obsługa logiki aplikacji
* games: folder w ktorym będziemy mieli wszystko do gier (poker, sloty...), raczej tutaj zrobimy modół pythonowy + api do komunikacji python-node
* middlewares: niestandarwode middleware typu: obsługa błędów, obsługa logowania, uwierzytelnianie ...
* models: modele danych (mongoDB)
* pubilc: plilki statyczne: html, css, js, zdjęcia...
* routes: definicje tras aplikacji
* sockets: logika socket.io
* tests: wiadomo
* utils: funkcje pomocnicze
* szablony ejs
    * layouts: layouty bazowy typu stopka, nagłówek
    * pages: strony widoków
    * partials: fragmenty wielokrotnego urzytku np menu 

---
pliki:

* server.js: punkt startowy aplikacji, uruchamianie serwera
* app.js: tworzenie i konfiguracja expressa