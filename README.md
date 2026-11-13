# Ora

Suivi d'habitudes pour Android, sombre et 100 % hors ligne : pas de compte, pas de serveur, pas de pub.
Coche tes habitudes du jour, suis ton score, tes séries et ton historique sur 16 semaines.

## Lancer l'app

```bash
npm install
npx expo start
```

Scanne le QR code avec Expo Go (Android). Remarque : **les rappels (notifications locales) ne se testent pas dans Expo Go** ;
il faut un build (APK ou development build, voir plus bas).

## Vérifier

```bash
npm run typecheck   # npx tsc --noEmit
npm test            # tests unitaires de la logique pure (node:test + tsx)
npx expo-doctor
npx expo export --platform android
```

Les tests couvrent : jour prévu / non prévu, score du jour, série en cours (week-end, aujourd'hui non fait, jour raté),
record, taux sur 30 jours, taux global, jours complets / ratés, retard, cases d'historique, validation d'import.

## Générer l'APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Le profil `preview` de `eas.json` produit un fichier **APK** installable directement sur le téléphone.

## Organisation

```
App.tsx                 navigation (état d'écran), polices, feuille modale
src/theme.ts            couleurs, rayons, dimensions, typographie
src/types.ts            Habit, Logs, AppData
src/dates.ts            clés locales yyyy-mm-dd (jamais d'UTC)
src/stats.ts            règles métier pures (score, séries, taux…)
src/backup.ts           validation stricte d'une sauvegarde
src/backupIO.ts         export (partage) / import (sélecteur de fichier)
src/storage.ts          AsyncStorage, clé unique ora:data:v1
src/notifications.ts    rappels hebdomadaires locaux, canal ora-reminders
src/store.tsx           état de l'app + persistance + replanification
src/components/         cartes, pastille de score, grille, feuille…
src/screens/            Jour, Stats, Historique, Réglages, Gérer
tests/                  tests unitaires
```

## Données

- Tout est stocké sur le téléphone (AsyncStorage, clé `ora:data:v1`).
- **Exporter** crée `ora-backup-AAAA-MM-JJ.json` et ouvre le partage Android.
- **Importer** vérifie le fichier, demande confirmation, puis **remplace** toutes les données et replanifie les rappels.
