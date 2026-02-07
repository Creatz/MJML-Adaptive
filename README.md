# MJML 4

Si vous cherchez MJML 3.3.X, consultez [cette branche](https://github.com/mjmlio/mjml/tree/3.3.x).

<p style="text-align: center;" >
  <a href="https://mjml.io" target="_blank">
    <img width="250"src="https://mjml.io/assets/img/litmus/mjmlbymailjet.png">

  </a>
</p>

<p style="text-align: center;" >
  <a href="https://github.com/mjmlio/mjml/actions">
    <img src="https://github.com/mjmlio/mjml/workflows/Mjml%20CI/badge.svg?branch=master" alt="github actions">
  </a>
  <a href="https://www.codacy.com/app/gbadi/mjml">
    <img src="https://api.codacy.com/project/badge/grade/575339cb861f4ff4b0dbb3f9e1759c35"/>
  </a>
</p>


<p style="text-align: center;" >
  | <b><a href="#documentation-traduite">Documentation traduite</a></b>
  | <b><a href="#introduction">Introduction</a></b>
  | <b><a href="#installation">Installation</a></b>
  | <b><a href="#utilisation">Utilisation</a></b> |
</p>

---
# Documentation traduite

| Langue | Lien vers la documentation |
| :-: | :-: |
| 日本語 | [Documentation japonaise](https://github.com/mjmlio/mjml/blob/master/readme-ja.md) |

# Introduction

`MJML` est un langage de balisage créé par [Mailjet](https://www.mailjet.com/) et conçu pour réduire la douleur du code responsive en email. Sa syntaxe sémantique rend le langage simple et direct, et sa riche bibliothèque de composants standards réduit votre temps de développement tout en allégeant votre code email. Le moteur open‑source MJML se charge de traduire le `MJML` que vous avez écrit en HTML responsive.

<p style="text-align: center;" >
  <a href="https://mjml.io" target="_blank">
    <img width="75%" src="https://cloud.githubusercontent.com/assets/6558790/12450760/ee034178-bf85-11e5-9dda-98d0c8f9f8d6.png">
  </a>
</p>

# MJML Adaptative: Variants (v0.1)

MJML Adaptative introduit un mécanisme optionnel `<variant>` pour exprimer des différences intentionnelles desktop/mobile sans post‑édition manuelle de HTML. La syntaxe MJML existante continue de fonctionner sans changement.

```mjml
<variant device="desktop">
  <mj-text>Desktop text version</mj-text>
</variant>
<variant device="mobile">
  <mj-text>Mobile text version</mj-text>
</variant>
```

Notes:
- Si aucun `<variant>` n'est présent, le rendu est identique à MJML aujourd'hui.
- `<variant>` doit encapsuler exactement un composant MJML.
- Ne placez pas `<variant>` à l'intérieur de composants comme `mj-text` ou `mj-image`.
- Les variants supportent des surcharges d'attributs sur le composant encapsulé (ex : `color`, `font-size`).

Styles de variants (mobile/desktop uniquement) :

```mjml
<mj-text
  font-size="20px"
  color="#F45E43"
  font-family="helvetica"
  variant-style-mobile="color:#002c5f;font-size:10px;line-height:1.2"
>
  Hello World
</mj-text>
```

Les attributs `variant-style-desktop` et `variant-style-mobile` injectent des classes CSS avec des règles `!important` pour surcharger les styles inline au breakpoint desktop ou mobile.

# MJML Adaptative: Options de sortie

Cette fork ajoute deux comportements de sortie activés par défaut :

- **CSS minifié dans `<head>`** : toutes les balises `<style>` sont minifiées après le rendu, tout en conservant un HTML formaté (beautified) pour la lisibilité.
- **Mode AMP** : ajoutez `amp="true"` sur `<mj-head>` pour injecter un tag de tracking juste après `<body>` et ajouter un attribut `alias` aléatoire sur chaque lien.

Exemple :

```mjml
<mjml>
  <mj-head amp="true">
    <mj-attributes>
      <mj-all font-family="helvetica" />
    </mj-attributes>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          <a href="https://example.com">Hello</a>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

Comportement HTML résultant :
- `<custom name="opencounter" type="tracking"/>` est inséré juste après `<body>`.
- Chaque `<a>` reçoit un attribut `alias="XXXXXX"` (4–8 caractères aléatoires).

# Installation

Vous pouvez installer `MJML` avec `NPM` pour l'utiliser avec NodeJS ou en ligne de commande (CLI). Si vous ne savez pas ce que c'est, consultez la section <a href="#utilisation">Utilisation</a>.

```bash
npm install mjml
```

# Développement

Pour travailler sur MJML, faites des modifications et créez des merge requests, téléchargez et installez [yarn](https://yarnpkg.com/lang/en/docs/install/) pour un développement simple.

```bash
git clone https://github.com/mjmlio/mjml.git && cd mjml
yarn
yarn build
```

Vous pouvez aussi lancer `yarn build:watch` pour recompiler les packages pendant que vous codez.

# Utilisation

## En ligne

Pas envie d'installer quoi que ce soit ? Utilisez l'éditeur en ligne gratuit !

<p style="text-align: center;" >
  <a href="https://mjml.io/try-it-live" target="_blank"><img src="https://cloud.githubusercontent.com/assets/6558790/12195421/58a40618-b5f7-11e5-9ed3-80463874ab14.png" alt="try it live" width="75%"></a>
</p>
<br>

## Applications et plugins

MJML dispose d'un écosystème d'outils et de plugins, découvrez :
- L'[application MJML](https://mjmlio.github.io/mjml-app/) (MJML est inclus)
- Le [plugin Visual Studio Code](https://github.com/mjmlio/vscode-mjml) (MJML est inclus)
- Le [plugin Sublime Text](https://packagecontrol.io/packages/MJML-syntax) (MJML doit être installé séparément)

Pour plus d'outils, consultez la page [Community](https://mjml.io/community).

## Interface en ligne de commande (CLI)

> Compile le fichier et écrit le HTML généré dans `output.html`

```bash
mjml input.mjml -o output.html
```

Vous pouvez passer des `arguments` optionnels au CLI et les combiner.

argument | description | valeur par défaut
---------|--------|--------------
`mjml -m [input]` | Migre un fichier MJML v3 vers la syntaxe v4 | NA
`mjml [input] -o [output]` | Écrit la sortie dans [output] | NA
`mjml [input] -s` | Écrit la sortie sur `stdout` | NA
`mjml -w [input]` | Surveille les changements sur `[input]` (fichier ou dossier) | NA
`mjml [input] --config.beautify` | Beautifie la sortie (`true` ou `false`) | true
`mjml [input] --config.minify` | Minifie la sortie (`true` ou `false`) | false

Voir la documentation de [mjml-cli](https://github.com/mjmlio/mjml/blob/master/packages/mjml-cli/README.md) pour plus d'informations sur les options de configuration.

## Dans Node.js

```javascript
import mjml2html from 'mjml'

/*
  Compiler une chaîne MJML
*/
const htmlOutput = mjml2html(`
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            Hello World
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`)
```

# Contribuer

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines de contribution.

# Licence

Consultez [LICENSE.md](LICENSE.md).
