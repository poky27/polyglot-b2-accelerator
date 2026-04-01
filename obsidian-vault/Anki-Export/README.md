# 🃏 Anki Export

## Cómo usar

1. Después de cada sesión con el tutor, pide: "genera flashcards para Anki"
2. El tutor generará un bloque tab-separated
3. Guarda como `.txt` en esta carpeta
4. En Anki: **File → Import** → selecciona el `.txt`

## Configuración de importación

- **Separador**: Tab
- **Tipo de nota**: Básico
- **Campo 1**: Frente (pregunta)
- **Campo 2**: Reverso (respuesta)
- **Campo 3**: Tags

## Tags jerárquicos

```
francais::grammaire::subjonctif
francais::vocabulaire::b2
francais::faux_amis
portugues::gramatica::preterito
portugues::vocabulario::b2
deutsch::grammatik::konjunktiv
deutsch::wortschatz::b2
deutsch::falsche_freunde
english::grammar::conditionals
english::vocabulary::b2
english::false_friends
transversal::cognados
transversal::modelos_mentales
```

## Ejemplo de formato

```
Comment dit-on 'tener razón' en français?	<b>Avoir raison</b> (no "être raison")	francais::expressions::b2
Was bedeutet 'Gift' auf Deutsch?	<b>Veneno</b> (falso amigo con inglés)	deutsch::falsche_freunde::b1
```
