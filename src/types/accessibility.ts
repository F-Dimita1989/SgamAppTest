/**
 * Tipi TypeScript per attributi di accessibilità
 * Questi tipi aiutano a garantire che gli attributi di accessibilità siano corretti
 * e completi, riducendo errori comuni in fase di sviluppo.
 */

/**
 * Ruoli ARIA validi per elementi interattivi e strutturali
 */
export type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'cell'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'definition'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem';

/**
 * Valori per aria-live
 */
export type AriaLive = 'off' | 'polite' | 'assertive';

/**
 * Valori per aria-expanded
 */
export type AriaExpanded = boolean | 'true' | 'false' | undefined;

/**
 * Valori per aria-selected
 */
export type AriaSelected = boolean | 'true' | 'false' | undefined;

/**
 * Valori per aria-autocomplete
 */
export type AriaAutocomplete = 'none' | 'inline' | 'list' | 'both';

/**
 * Valori per aria-invalid
 */
export type AriaInvalid = boolean | 'true' | 'false' | 'grammar' | 'spelling';

/**
 * Valori per aria-required
 */
export type AriaRequired = boolean | 'true' | 'false';

/**
 * Valori per aria-haspopup
 */
export type AriaHasPopup = 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';

/**
 * Valori per aria-current
 */
export type AriaCurrent = 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';

/**
 * Valori per aria-orientation
 */
export type AriaOrientation = 'horizontal' | 'vertical';

/**
 * Valori per aria-sort
 */
export type AriaSort = 'none' | 'ascending' | 'descending' | 'other';

/**
 * Interfaccia base per attributi di accessibilità comuni
 */
export interface BaseAccessibilityProps {
  /**
   * Testo alternativo per immagini (obbligatorio per immagini informative)
   * Deve descrivere accuratamente il contenuto dell'immagine
   */
  alt?: string;
  
  /**
   * Etichetta ARIA per elementi interattivi senza testo visibile
   * Deve essere descrittiva e comprensibile anche fuori dal contesto
   */
  'aria-label'?: string;
  
  /**
   * Riferimento a elemento che fornisce l'etichetta
   */
  'aria-labelledby'?: string;
  
  /**
   * Riferimento a elemento che fornisce la descrizione
   */
  'aria-describedby'?: string;
  
  /**
   * Ruolo ARIA per elementi che necessitano di semantica aggiuntiva
   */
  role?: AriaRole;
  
  /**
   * Indica se l'elemento è nascosto agli screen reader
   * Usare solo per elementi puramente decorativi
   */
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * Interfaccia per elementi interattivi (bottoni, link, ecc.)
 */
export interface InteractiveAccessibilityProps extends BaseAccessibilityProps {
  /**
   * Indica se l'elemento è espanso (per menu, accordion, ecc.)
   */
  'aria-expanded'?: AriaExpanded;
  
  /**
   * Indica se l'elemento ha un popup
   */
  'aria-haspopup'?: AriaHasPopup;
  
  /**
   * Riferimento all'elemento controllato
   */
  'aria-controls'?: string;
  
  /**
   * Indica se l'elemento è selezionato
   */
  'aria-selected'?: AriaSelected;
  
  /**
   * Indica se l'elemento è corrente (per navigazione)
   */
  'aria-current'?: AriaCurrent;
  
  /**
   * Indica se l'elemento è disabilitato
   */
  'aria-disabled'?: boolean | 'true' | 'false';
}

/**
 * Interfaccia per input e form
 */
export interface FormAccessibilityProps extends BaseAccessibilityProps {
  /**
   * Indica se l'input è obbligatorio
   */
  'aria-required'?: AriaRequired;
  
  /**
   * Indica se l'input ha un errore di validazione
   */
  'aria-invalid'?: AriaInvalid;
  
  /**
   * Tipo di autocompletamento
   */
  'aria-autocomplete'?: AriaAutocomplete;
  
  /**
   * Riferimento all'opzione attiva (per listbox)
   */
  'aria-activedescendant'?: string;
}

/**
 * Interfaccia per regioni live (annunci dinamici)
 */
export interface LiveRegionAccessibilityProps extends BaseAccessibilityProps {
  /**
   * Tipo di annuncio per screen reader
   */
  'aria-live'?: AriaLive;
  
  /**
   * Indica se l'intera regione deve essere annunciata
   */
  'aria-atomic'?: boolean | 'true' | 'false';
  
  /**
   * Indica se la regione è occupata
   */
  'aria-busy'?: boolean | 'true' | 'false';
}

/**
 * Interfaccia per immagini
 */
export interface ImageAccessibilityProps {
  /**
   * Testo alternativo (obbligatorio per immagini informative)
   * Per immagini decorative, usare alt="" e aria-hidden="true"
   */
  alt: string;
  
  /**
   * Indica se l'immagine è decorativa (non informativa)
   */
  'aria-hidden'?: boolean | 'true' | 'false';
  
  /**
   * Lazy loading per migliorare le performance
   */
  loading?: 'lazy' | 'eager';
}

/**
 * Interfaccia per bottoni
 */
export interface ButtonAccessibilityProps extends InteractiveAccessibilityProps {
  /**
   * Tipo di bottone
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * Indica se il bottone è disabilitato
   */
  disabled?: boolean;
}

/**
 * Interfaccia per link
 */
export interface LinkAccessibilityProps extends InteractiveAccessibilityProps {
  /**
   * URL di destinazione
   */
  href: string;
  
  /**
   * Indica se il link si apre in una nuova scheda
   */
  target?: '_blank' | '_self' | '_parent' | '_top';
  
  /**
   * Relazione del link (per sicurezza)
   */
  rel?: string;
}

/**
 * Interfaccia per modali/dialoghi
 */
export interface ModalAccessibilityProps extends BaseAccessibilityProps {
  /**
   * Ruolo del modale (sempre 'dialog' per modali)
   */
  role: 'dialog' | 'alertdialog';
  
  /**
   * Indica se il modale è modale (blocca interazione con resto della pagina)
   */
  'aria-modal': boolean | 'true' | 'false';
  
  /**
   * Riferimento all'elemento che fornisce il titolo
   */
  'aria-labelledby': string;
  
  /**
   * Riferimento all'elemento che fornisce la descrizione (opzionale)
   */
  'aria-describedby'?: string;
}

/**
 * Interfaccia per tab
 */
export interface TabAccessibilityProps extends InteractiveAccessibilityProps {
  /**
   * Ruolo del tab (sempre 'tab')
   */
  role: 'tab';
  
  /**
   * Indica se il tab è selezionato
   */
  'aria-selected': AriaSelected;
  
  /**
   * Riferimento al tabpanel controllato
   */
  'aria-controls': string;
  
  /**
   * Indice del tab per navigazione tastiera
   */
  tabIndex: number;
}

/**
 * Interfaccia per tabpanel
 */
export interface TabPanelAccessibilityProps extends BaseAccessibilityProps {
  /**
   * Ruolo del tabpanel (sempre 'tabpanel')
   */
  role: 'tabpanel';
  
  /**
   * Riferimento al tab che controlla questo panel
   */
  'aria-labelledby': string;
  
  /**
   * Indica se il panel è attivo
   */
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * Interfaccia per listbox
 */
export interface ListboxAccessibilityProps extends BaseAccessibilityProps {
  /**
   * Ruolo della listbox (sempre 'listbox')
   */
  role: 'listbox';
  
  /**
   * Riferimento all'input che controlla questa listbox
   */
  'aria-controls'?: string;
  
  /**
   * Indica se la listbox è espansa
   */
  'aria-expanded'?: AriaExpanded;
}

/**
 * Interfaccia per opzioni in listbox
 */
export interface OptionAccessibilityProps extends BaseAccessibilityProps {
  /**
   * Ruolo dell'opzione (sempre 'option')
   */
  role: 'option';
  
  /**
   * Indica se l'opzione è selezionata
   */
  'aria-selected': AriaSelected;
}

/**
 * Helper type per estendere props HTML standard con attributi di accessibilità
 */
export type WithAccessibility<T> = T & BaseAccessibilityProps;

/**
 * Helper type per componenti che accettano props di accessibilità
 */
export type AccessibilityAwareComponent<T = Record<string, never>> = React.FC<T & BaseAccessibilityProps>;

