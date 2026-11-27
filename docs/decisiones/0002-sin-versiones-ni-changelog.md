# 0002. Sin versiones ni changelog

- Estado: aceptada
- Fecha: 2026-11-26

## Contexto

`tech/repository.md` pide `CHANGELOG.md` y etiquetas `vX.Y.Z` en todo
repositorio público. El perfil no tiene usuarios que actualicen una versión.
Se regenera cada día y publica en cada push a `main`, según el ADR 0001.

## Decisión

- El perfil no lleva números de versión, etiquetas ni `CHANGELOG.md`.
- La historia de cambios es el historial de `main`, con mensajes de
  Conventional Commits y un PR por cambio.

## Consecuencias

- Una etiqueta por publicación diaria llenaría el repositorio de versiones
  que nadie consulta.
- Si el generador se publica algún día como paquete, esta decisión se
  revisa y el paquete nace con `0.1.0` y su changelog.
