# Instrucțiuni pentru Adăugarea Datelor de Test

Pentru a adăuga date de test în aplicație, urmează acești pași:

## Pasul 1: Înregistrează 5 Utilizatori de Test

Accesează pagina `/auth` și creează următoarele conturi:

1. **maria@test.md** (parola: test123)
   - Username: maria_md
   - Nume: Maria Popescu

2. **ion@test.md** (parola: test123)
   - Username: ion_style
   - Nume: Ion Rusu

3. **elena@test.md** (parola: test123)
   - Username: elena_fashion
   - Nume: Elena Ciobanu

4. **andrei@test.md** (parola: test123)
   - Username: andrei_tech
   - Nume: Andrei Moraru

5. **ana@test.md** (parola: test123)
   - Username: ana_kids
   - Nume: Ana Dumitru

## Pasul 2: Rulează Script-ul SQL

După ce ai creat utilizatorii, accesează backend-ul și rulează următorul SQL:

```sql
-- Actualizează profilurile cu informații suplimentare
UPDATE public.profiles SET 
  bio = 'Vând haine second-hand de calitate. Livrare în toată Moldova!',
  location = 'Chișinău',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
WHERE username = 'maria_md';

UPDATE public.profiles SET 
  bio = 'Colecționar de sneakers. Toate produsele sunt autentice.',
  location = 'Bălți',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ion'
WHERE username = 'ion_style';

UPDATE public.profiles SET 
  bio = 'Pasionată de modă. Vând din garderoba personală.',
  location = 'Chișinău',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'
WHERE username = 'elena_fashion';

UPDATE public.profiles SET 
  bio = 'Vând electronice second-hand în stare perfectă.',
  location = 'Cahul',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrei'
WHERE username = 'andrei_tech';

UPDATE public.profiles SET 
  bio = 'Mamă de doi copii. Vând haine pentru copii care nu mai încap.',
  location = 'Orhei',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
WHERE username = 'ana_kids';
```

## Pasul 3: Adaugă Produse Mock

Acest script va fi disponibil în curând printr-o funcționalitate automată.
