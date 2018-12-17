"use strict";

/**
 * TerraFly namespace
 * @public
 * @class
 * @namespace
 * @description <b>tf</b> is the TerraFly API root namespace
*/
var tf = {
    /**
     * class types
     * @public
     * @class
     * @namespace
     * @description Components in this namespace define the types used in the TerraFly API.
    */
    types: {},

   /**
     * class consts
     * @public
     * @class
     * @namespace
     * @description Components in this namespace define the constants used in the TerraFly API. Applications should always
     * use these constants instead of referring directly to their corresponding literal values.
    */
    consts: {},

    /**
     * class platform
     * @public
     * @class
     * @namespace
     * @description Components in this namespace are related with the platform (Test, Stage, or Production) in which the application is running.
    */
    platform: {},

    /**
     * class browser
     * @public
     * @class
     * @namespace
     * @description Components in this namespace are related to the Browser that is currently running the application.
    */
    browser: {},

    /**
     * class helpers
     * @public
     * @class
     * @namespace
     * @description This namespace contains miscellaneous auxiliary components.
    */
    helpers: {},

    /**
     * class units
     * @public
     * @class
     * @namespace
     * @description Componenents in this namespace are related to measurements and unit conversions.
    */
    units: {},

    /**
     * class js
     * @public
     * @class
     * @namespace
     * @description Components in this namespace are related to JavaScript programming.
    */
    js: {},

    /**
     * class layout
     * @public
     * @class
     * @namespace
     * @description Components in this namespace support building HTML application layouts.
    */
    layout: {},

    /**
     * class dom
     * @public
     * @class
     * @namespace
     * @description Components in this namespace encapsulate access to HTML elements.
    */
    dom: {},

    /**
     * class events
     * @public
     * @class
     * @namespace
     * @description Components in this namespace support event listener registration and event dispatching.
    */
    events: {},

    /**
     * class ui
     * @public
     * @class
     * @namespace
     * @description Components in this namespace encapsulate access to high level user interface items.
    */
    ui: {},

    /**
     * class apps
     * @private
     * @class
     * @namespace
     * @description Components in this namespace are related to specific TerraFly applications.
    */
    apps: {},

    /**
     * class ajax
     * @public
     * @class
     * @namespace
     * @description Components in this namespace support access to remote services.
    */
    ajax: {},

    /**
     * class styles
     * @public
     * @class
     * @namespace
     * @description Components in this namespace support JavaScript programmatic access to CSS/HTML application styling.
    */
    styles: {},

    /**
     * class canvas
     * @public
     * @class
     * @namespace
     * @description Components in this namespace are related with HTML5 canvas drawing.
    */
    canvas: {},

    /**
     * class map
     * @public
     * @class
     * @namespace
     * @description Components in this namespace implement the TerraFly Map API.
    */
    map: {
        /**
         * class ui
         * @private
         * @class
         * @namespace
         * @description Components in this namespace implement user interface items used by the TerraFly MAP API.
        */
        ui: {},

        /**
         * class aux
         * @private
         * @class
         * @namespace
         * @description Components in this namespace implement auxiliary functionality required by the TerraFly MAP API.
        */
        aux: {}
    },

   /**
   * class urlapi
   * @public
   * @class
   * @namespace
   * @description Components in this namespace implement the TerraFly URL-API and encapsulate the creation of TerraFly maps and applications according to [URL Parameters]{@link tf.types.URLParameters}
  */
    urlapi: { },

    /**
    * class services
    * @public
    * @class
    * @namespace
    * @description Components in this namespace encapsulate access to TerraFly services.
   */
    services: { },

    /**
    * class services
    * @public
    * @class
    * @namespace
    * @description Components in this namespace encapsulate access to mathematical objects and functions.
   */
    math: { }
};

tf.g_Styles = null;
tf.g_SvgGlyphBtnMaker = null;
tf.g_Counter = null;
tf.g_Debug = null;
tf.g_DocMouseListener = null;
tf.g_UtmGdcConverter = null;
tf.g_LevelResolutionConverter = null;
tf.g_scriptCallDispatcher = null;
tf.g_SvgGlyphLib = null;

