# Breeze Villa Booking Engine v1.0

## Obiectiv
Clientul alege perioada, adulții, copiii și vârstele copiilor. Sistemul calculează automat combinațiile disponibile de apartamente și afișează prima dată cea mai ieftină variantă.

## Capacitate maximă locație
- Maximum 32 persoane.

## Reguli copii
- Copiii de 10 ani sau mai mari sunt calculați ca adulți.
- Copiii sub 10 ani pot intra în regula de ocupare pentru familii:
  - maximum 1 copil mic la 2 adulți poate sta fără loc separat;
  - copiii mici rămași se calculează 2 copii = 1 loc adult;
  - un copil mic rămas singur ocupă 1 loc.

## Sortare variante
1. Cel mai mic preț.
2. Dacă prețul este egal: cele mai puține apartamente.
3. Dacă și acestea sunt egale: cele mai puține locuri neocupate.

## Reguli de comunicare
- Nu folosim termeni precum exclusivitate, închiriere integrală, private property, entire villa.
- Afișăm: cea mai bună combinație de apartamente pentru grupul dumneavoastră.
