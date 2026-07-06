(() => {
  const STORAGE_KEY = "lcarsLanguage";

  const LANGUAGES = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    ja: "日本語"
  };

  const STRINGS = {
    en: {
      languageLabel: "Language",
      siteTitle: "LCARS Niagara Launcher Theme",
      siteSubtitle: "Download the Niagara theme file and generate matching LCARS wallpapers.",
      downloadTheme: "Download Theme File",
      openIconGenerator: "Open Icon Generator",
      openFontGuide: "Open Font Guide",
      aboutCredits: "About / Credits",
      browseGallery: "Browse Gallery",
      setupPathTitle: "Setup path",
      setupStep1: "<strong>Download the Niagara theme file.</strong> Import the included <code>.nlt</code> file into Niagara Launcher.",
      setupStep2: "<strong>Generate a matching LCARS wallpaper.</strong> Pick your device size, palette, spine position, thickness, segment length, and panel rhythm.",
      setupStep3: "<strong>Install Trek-inspired fonts locally.</strong> Open the Font Guide, install fonts from their original sources, then preview them against a Niagara-style app list.",
      setupStep4: "<strong>Export your Niagara app list.</strong> Use Niagara's export so the icon generator can categorize your actual apps.",
      setupStep5: "<strong>Build the LCARS icon pack.</strong> Review categories, fix anything weird, and build the signed APK.",
      setupStep6: "<strong>Apply and iterate.</strong> Use the theme, wallpaper, font choice, and icon pack together; share reviewed mappings to improve future matching.",
      accessibilityNoteTitle: "Accessibility note",
      accessibilityNoteBody: "For better color distinction, try the High Contrast, Grayscale LCARS, or E-Ink Soft palettes. The webpage also includes keyboard focus outlines, skip links, screen-reader status messages, and a text description of the wallpaper preview.",
      wallpaperGeneratorTitle: "Wallpaper Generator",
      devicePreset: "Device preset",
      width: "Width",
      height: "Height",
      palette: "Palette",
      customSectionColorsSummary: "<strong>Custom section colors</strong> — choose Custom Palette above to color each wallpaper section directly.",
      spinePosition: "Spine position",
      horizontalLineHeight: "Horizontal line height",
      thicknessScale: "Thickness / scale",
      horizontalSegmentLength: "Horizontal segment length",
      rightEdgeSafetyMargin: "Right edge safety margin",
      panelRhythm: "Panel rhythm",
      colorMapping: "Color mapping",
      panelRhythmHint: "Panel rhythm controls proportions. Color mapping controls how palette slots are assigned to the LCARS blocks. Use Palette sweep or Flag stripes for rainbow, pride, and regional flag palettes.",
      panelRhythmHint2: "Panel rhythm changes the static color-block proportions while keeping the LCARS elbow shape intact.",
      downloadWallpaper: "Download Wallpaper PNG",
      resolutionHint: "Resolution presets are focused on Android devices for Niagara Launcher. Use Custom exact size when your device is not listed.",
      wallpaperPreview: "Wallpaper preview",
      previewFallback: "Preview updates after you change wallpaper settings."
    },

    es: {
      languageLabel: "Idioma",
      siteTitle: "Tema LCARS para Niagara Launcher",
      siteSubtitle: "Descarga el archivo de tema de Niagara y genera fondos LCARS a juego.",
      downloadTheme: "Descargar archivo de tema",
      openIconGenerator: "Abrir generador de iconos",
      openFontGuide: "Abrir guía de fuentes",
      aboutCredits: "Acerca de / Créditos",
      browseGallery: "Ver galería",
      setupPathTitle: "Ruta de configuración",
      setupStep1: "<strong>Descarga el archivo de tema de Niagara.</strong> Importa el archivo <code>.nlt</code> incluido en Niagara Launcher.",
      setupStep2: "<strong>Genera un fondo LCARS a juego.</strong> Elige tamaño de dispositivo, paleta, posición de la columna, grosor, longitud de segmentos y ritmo de paneles.",
      setupStep3: "<strong>Instala fuentes inspiradas en Star Trek localmente.</strong> Abre la guía de fuentes, instala fuentes desde sus fuentes originales y pruébalas con una lista de apps estilo Niagara.",
      setupStep4: "<strong>Exporta tu lista de apps de Niagara.</strong> Usa la exportación de Niagara para que el generador de iconos pueda categorizar tus apps reales.",
      setupStep5: "<strong>Crea el paquete de iconos LCARS.</strong> Revisa las categorías, corrige lo extraño y genera el APK firmado.",
      setupStep6: "<strong>Aplica e itera.</strong> Usa tema, fondo, fuente e iconos juntos; comparte asignaciones revisadas para mejorar coincidencias futuras.",
      accessibilityNoteTitle: "Nota de accesibilidad",
      accessibilityNoteBody: "Para distinguir mejor los colores, prueba las paletas Alto contraste, LCARS en escala de grises o E-Ink Soft. La página también incluye contornos de foco para teclado, enlaces de salto, mensajes de estado para lectores de pantalla y una descripción textual de la vista previa del fondo.",
      wallpaperGeneratorTitle: "Generador de fondos",
      devicePreset: "Preajuste de dispositivo",
      width: "Ancho",
      height: "Alto",
      palette: "Paleta",
      customSectionColorsSummary: "<strong>Colores personalizados por sección</strong> — elige Paleta personalizada arriba para colorear directamente cada sección del fondo.",
      spinePosition: "Posición de la columna",
      horizontalLineHeight: "Altura de línea horizontal",
      thicknessScale: "Grosor / escala",
      horizontalSegmentLength: "Longitud del segmento horizontal",
      rightEdgeSafetyMargin: "Margen de seguridad del borde derecho",
      panelRhythm: "Ritmo de paneles",
      colorMapping: "Mapeo de color",
      panelRhythmHint: "El ritmo de paneles controla proporciones. El mapeo de color controla cómo se asignan los colores de la paleta a los bloques LCARS. Usa Barrido de paleta o Franjas de bandera para arcoíris, orgullo y paletas regionales.",
      panelRhythmHint2: "El ritmo de paneles cambia las proporciones de los bloques de color estáticos manteniendo intacta la forma de codo LCARS.",
      downloadWallpaper: "Descargar fondo PNG",
      resolutionHint: "Los preajustes de resolución están centrados en dispositivos Android para Niagara Launcher. Usa Tamaño exacto personalizado si tu dispositivo no aparece.",
      wallpaperPreview: "Vista previa del fondo",
      previewFallback: "La vista previa se actualiza cuando cambias los ajustes del fondo."
    },

    fr: {
      languageLabel: "Langue",
      siteTitle: "Thème LCARS pour Niagara Launcher",
      siteSubtitle: "Téléchargez le fichier de thème Niagara et générez des fonds d’écran LCARS assortis.",
      downloadTheme: "Télécharger le fichier de thème",
      openIconGenerator: "Ouvrir le générateur d’icônes",
      openFontGuide: "Ouvrir le guide des polices",
      aboutCredits: "À propos / Crédits",
      browseGallery: "Parcourir la galerie",
      setupPathTitle: "Parcours de configuration",
      setupStep1: "<strong>Téléchargez le fichier de thème Niagara.</strong> Importez le fichier <code>.nlt</code> inclus dans Niagara Launcher.",
      setupStep2: "<strong>Générez un fond LCARS assorti.</strong> Choisissez la taille de l’appareil, la palette, la position de la colonne, l’épaisseur, la longueur des segments et le rythme des panneaux.",
      setupStep3: "<strong>Installez localement des polices inspirées de Star Trek.</strong> Ouvrez le guide des polices, installez les polices depuis leurs sources d’origine, puis prévisualisez-les avec une liste d’apps façon Niagara.",
      setupStep4: "<strong>Exportez votre liste d’apps Niagara.</strong> Utilisez l’export Niagara pour que le générateur d’icônes puisse catégoriser vos vraies apps.",
      setupStep5: "<strong>Créez le pack d’icônes LCARS.</strong> Vérifiez les catégories, corrigez ce qui semble étrange et générez l’APK signé.",
      setupStep6: "<strong>Appliquez et ajustez.</strong> Utilisez ensemble le thème, le fond, la police et le pack d’icônes ; partagez les correspondances vérifiées pour améliorer les futurs résultats.",
      accessibilityNoteTitle: "Note d’accessibilité",
      accessibilityNoteBody: "Pour mieux distinguer les couleurs, essayez les palettes Contraste élevé, LCARS en niveaux de gris ou E-Ink Soft. La page inclut aussi des contours de focus au clavier, des liens de saut, des messages d’état pour lecteurs d’écran et une description textuelle de l’aperçu du fond.",
      wallpaperGeneratorTitle: "Générateur de fonds",
      devicePreset: "Préréglage d’appareil",
      width: "Largeur",
      height: "Hauteur",
      palette: "Palette",
      customSectionColorsSummary: "<strong>Couleurs personnalisées par section</strong> — choisissez Palette personnalisée ci-dessus pour colorer directement chaque section du fond.",
      spinePosition: "Position de la colonne",
      horizontalLineHeight: "Hauteur de la ligne horizontale",
      thicknessScale: "Épaisseur / échelle",
      horizontalSegmentLength: "Longueur du segment horizontal",
      rightEdgeSafetyMargin: "Marge de sécurité du bord droit",
      panelRhythm: "Rythme des panneaux",
      colorMapping: "Mappage des couleurs",
      panelRhythmHint: "Le rythme des panneaux contrôle les proportions. Le mappage des couleurs contrôle l’affectation des emplacements de palette aux blocs LCARS. Utilisez Balayage de palette ou Bandes de drapeau pour les palettes arc-en-ciel, fierté et régionales.",
      panelRhythmHint2: "Le rythme des panneaux modifie les proportions des blocs de couleur statiques tout en conservant la forme de coude LCARS.",
      downloadWallpaper: "Télécharger le PNG",
      resolutionHint: "Les préréglages de résolution sont centrés sur les appareils Android pour Niagara Launcher. Utilisez la taille exacte personnalisée si votre appareil n’est pas listé.",
      wallpaperPreview: "Aperçu du fond",
      previewFallback: "L’aperçu se met à jour lorsque vous modifiez les réglages du fond."
    },

    de: {
      languageLabel: "Sprache",
      siteTitle: "LCARS-Theme für Niagara Launcher",
      siteSubtitle: "Lade die Niagara-Theme-Datei herunter und erzeuge passende LCARS-Hintergründe.",
      downloadTheme: "Theme-Datei herunterladen",
      openIconGenerator: "Icon-Generator öffnen",
      openFontGuide: "Schriftarten-Leitfaden öffnen",
      aboutCredits: "Info / Credits",
      browseGallery: "Galerie ansehen",
      setupPathTitle: "Einrichtungspfad",
      setupStep1: "<strong>Lade die Niagara-Theme-Datei herunter.</strong> Importiere die enthaltene <code>.nlt</code>-Datei in Niagara Launcher.",
      setupStep2: "<strong>Erzeuge einen passenden LCARS-Hintergrund.</strong> Wähle Gerätegröße, Palette, Spaltenposition, Stärke, Segmentlänge und Panel-Rhythmus.",
      setupStep3: "<strong>Installiere lokal Star-Trek-inspirierte Schriften.</strong> Öffne den Schriftarten-Leitfaden, installiere Schriften aus ihren Originalquellen und teste sie mit einer Niagara-ähnlichen App-Liste.",
      setupStep4: "<strong>Exportiere deine Niagara-App-Liste.</strong> Nutze den Niagara-Export, damit der Icon-Generator deine echten Apps kategorisieren kann.",
      setupStep5: "<strong>Baue das LCARS-Icon-Pack.</strong> Prüfe Kategorien, korrigiere Unstimmigkeiten und erstelle das signierte APK.",
      setupStep6: "<strong>Anwenden und verfeinern.</strong> Nutze Theme, Hintergrund, Schriftwahl und Icon-Pack zusammen; teile geprüfte Zuordnungen, um zukünftige Treffer zu verbessern.",
      accessibilityNoteTitle: "Hinweis zur Barrierefreiheit",
      accessibilityNoteBody: "Für bessere Farbunterscheidung probiere die Paletten Hoher Kontrast, Grayscale LCARS oder E-Ink Soft. Die Webseite enthält außerdem Tastatur-Fokusrahmen, Sprunglinks, Statusmeldungen für Screenreader und eine Textbeschreibung der Hintergrundvorschau.",
      wallpaperGeneratorTitle: "Hintergrund-Generator",
      devicePreset: "Gerätevorlage",
      width: "Breite",
      height: "Höhe",
      palette: "Palette",
      customSectionColorsSummary: "<strong>Benutzerdefinierte Abschnittsfarben</strong> — wähle oben Benutzerdefinierte Palette, um jeden Hintergrundabschnitt direkt einzufärben.",
      spinePosition: "Spaltenposition",
      horizontalLineHeight: "Höhe der horizontalen Linie",
      thicknessScale: "Stärke / Skalierung",
      horizontalSegmentLength: "Länge des horizontalen Segments",
      rightEdgeSafetyMargin: "Sicherheitsrand rechts",
      panelRhythm: "Panel-Rhythmus",
      colorMapping: "Farbzuordnung",
      panelRhythmHint: "Der Panel-Rhythmus steuert die Proportionen. Die Farbzuordnung steuert, wie Palettenplätze den LCARS-Blöcken zugewiesen werden. Nutze Palettenverlauf oder Flaggenstreifen für Regenbogen-, Pride- und regionale Paletten.",
      panelRhythmHint2: "Der Panel-Rhythmus verändert die Proportionen der statischen Farbblöcke und erhält dabei die LCARS-Bogenform.",
      downloadWallpaper: "Hintergrund-PNG herunterladen",
      resolutionHint: "Die Auflösungsvorlagen sind auf Android-Geräte für Niagara Launcher ausgerichtet. Nutze die benutzerdefinierte exakte Größe, wenn dein Gerät nicht aufgeführt ist.",
      wallpaperPreview: "Hintergrundvorschau",
      previewFallback: "Die Vorschau wird aktualisiert, wenn du die Hintergrund-Einstellungen änderst."
    },

    ja: {
      languageLabel: "言語",
      siteTitle: "Niagara Launcher 用 LCARS テーマ",
      siteSubtitle: "Niagara のテーマファイルをダウンロードし、対応する LCARS 風壁紙を生成します。",
      downloadTheme: "テーマファイルをダウンロード",
      openIconGenerator: "アイコン生成を開く",
      openFontGuide: "フォントガイドを開く",
      aboutCredits: "概要 / クレジット",
      browseGallery: "ギャラリーを見る",
      setupPathTitle: "セットアップ手順",
      setupStep1: "<strong>Niagara のテーマファイルをダウンロードします。</strong> 同梱の <code>.nlt</code> ファイルを Niagara Launcher にインポートします。",
      setupStep2: "<strong>対応する LCARS 壁紙を生成します。</strong> 端末サイズ、パレット、スパイン位置、太さ、セグメント長、パネルリズムを選びます。",
      setupStep3: "<strong>Star Trek 風フォントを端末にインストールします。</strong> フォントガイドを開き、元の配布元からフォントを入れて、Niagara 風アプリ一覧で確認します。",
      setupStep4: "<strong>Niagara のアプリ一覧をエクスポートします。</strong> Niagara のエクスポートを使うと、アイコン生成ツールが実際のアプリを分類できます。",
      setupStep5: "<strong>LCARS アイコンパックを作成します。</strong> カテゴリを確認し、不自然なものを直して、署名済み APK を生成します。",
      setupStep6: "<strong>適用して調整します。</strong> テーマ、壁紙、フォント、アイコンパックを組み合わせ、確認済みの分類を共有して今後の一致精度を高めます。",
      accessibilityNoteTitle: "アクセシビリティについて",
      accessibilityNoteBody: "色の区別をしやすくするには、High Contrast、Grayscale LCARS、E-Ink Soft パレットを試してください。このページには、キーボードのフォーカス表示、スキップリンク、スクリーンリーダー向けの状態メッセージ、壁紙プレビューのテキスト説明も含まれています。",
      wallpaperGeneratorTitle: "壁紙生成",
      devicePreset: "端末プリセット",
      width: "幅",
      height: "高さ",
      palette: "パレット",
      customSectionColorsSummary: "<strong>セクションごとのカスタム色</strong> — 上でカスタムパレットを選ぶと、壁紙の各セクションを直接指定できます。",
      spinePosition: "スパイン位置",
      horizontalLineHeight: "水平ラインの高さ",
      thicknessScale: "太さ / スケール",
      horizontalSegmentLength: "水平セグメント長",
      rightEdgeSafetyMargin: "右端の安全余白",
      panelRhythm: "パネルリズム",
      colorMapping: "色の割り当て",
      panelRhythmHint: "パネルリズムは比率を制御します。色の割り当ては、パレットの色を LCARS ブロックへどう割り当てるかを制御します。虹、プライド、地域旗風のパレットには Palette sweep や Flag stripes を使います。",
      panelRhythmHint2: "パネルリズムは、LCARS のエルボー形状を保ちながら、静的な色ブロックの比率を変えます。",
      downloadWallpaper: "壁紙 PNG をダウンロード",
      resolutionHint: "解像度プリセットは Niagara Launcher 向けの Android 端末を中心にしています。端末が一覧にない場合は、カスタムの正確なサイズを使ってください。",
      wallpaperPreview: "壁紙プレビュー",
      previewFallback: "壁紙設定を変更するとプレビューが更新されます。"
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function getLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && STRINGS[saved]) return saved;
    const browserLang = (navigator.language || "en").slice(0, 2);
    return STRINGS[browserLang] ? browserLang : "en";
  }

  function applyLanguage(lang) {
    const strings = STRINGS[lang] || STRINGS.en;
    document.documentElement.lang = lang;

    for (const el of $$("[data-i18n]")) {
      const key = el.dataset.i18n;
      if (strings[key]) el.textContent = strings[key];
    }

    for (const el of $$("[data-i18n-html]")) {
      const key = el.dataset.i18nHtml;
      if (strings[key]) el.innerHTML = strings[key];
    }

    for (const el of $$("[data-i18n-placeholder]")) {
      const key = el.dataset.i18nPlaceholder;
      if (strings[key]) el.setAttribute("placeholder", strings[key]);
    }

    for (const el of $$("[data-i18n-aria-label]")) {
      const key = el.dataset.i18nAriaLabel;
      if (strings[key]) el.setAttribute("aria-label", strings[key]);
    }

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function installLanguagePicker() {
    if ($("#lcarsLanguageSelect")) return;

    const main = $("main");
    if (!main) return;

    const wrap = document.createElement("label");
    wrap.className = "languagePicker";

    const label = document.createElement("span");
    label.dataset.i18n = "languageLabel";
    label.textContent = STRINGS.en.languageLabel;

    const select = document.createElement("select");
    select.id = "lcarsLanguageSelect";
    select.setAttribute("aria-label", STRINGS.en.languageLabel);

    for (const [code, labelText] of Object.entries(LANGUAGES)) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = labelText;
      select.appendChild(option);
    }

    wrap.appendChild(label);
    wrap.appendChild(select);
    main.insertAdjacentElement("afterbegin", wrap);

    select.value = getLanguage();
    select.addEventListener("change", () => applyLanguage(select.value));
  }

  function init() {
    installLanguagePicker();
    applyLanguage(getLanguage());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
