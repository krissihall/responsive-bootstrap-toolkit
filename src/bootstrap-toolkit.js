/**
  * Equivalent to jQuery's ready() function.
  *
  * @see https://gomakethings.com/a-native-javascript-equivalent-of-jquerys-ready-method/
  * @param {function} fn - The callback function.
  * @return {void}
  */
let DocReady = function( fn ) {
    if ( 'function' !== typeof fn ) { // Sanity check
        return;
    }
    if ( document.readyState === 'complete'  ) {
        return fn();
    }
    document.addEventListener( 'DOMContentLoaded', fn, false );
};

/*!
 * Responsive Bootstrap Toolkit
 * Author:    Maciej Gurban
 * License:   MIT
 * Version:   2.6.3 (2016-06-21)
 * Origin:    https://github.com/maciej-gurban/responsive-bootstrap-toolkit
 * Fork:      
 */

let ResponsiveBootstrapToolkit = (function (ready) {
    // Internal methods
    let internal = {

        /**
         * Breakpoint detection divs for each framework version
         */
        detectionDivs: {
            // Bootstrap 5
            bootstrap: {
                'xs': 'device-xs d-block d-sm-none',
                'sm': 'device-sm d-none d-sm-block d-md-none',
                'md': 'device-md d-none d-md-block d-lg-none',
                'lg': 'device-lg d-none d-lg-block d-xl-none',
                'xl': 'device-xl d-none d-xl-block d-xxl-none',
                'xxl': 'device-xxl d-none d-xxl-block'
            },
            // Foundation 5
            foundation: {
                'xsmall':  '<div class="device-xs show-for-xsmall-only"></div>',
                'small':  '<div class="device-sm show-for-small-only"></div>',
                'medium': '<div class="device-md show-for-medium-only"></div>',
                'large':  '<div class="device-lg show-for-large-only"></div>',
                'xlarge': '<div class="device-xl show-for-xlarge-only"></div>',
                'xxlarge': '<div class="device-xxl show-for-xxlarge-only"></div>'
            }
        },

         /**
         * Append visibility divs after DOM laoded
         */
        applyDetectionDivs: function () {
            ready(function () {
                for (const [key, value] of Object.entries(self.breakpoints)) {
                    let $ele = document.createElement('div');
                    $ele.classList = value;
                    document.querySelector('.responsive-bootstrap-toolkit')
                      .appendChild($ele);
                }
            });
        },

        /**
         * Determines whether passed string is a parsable expression
         */
        isAnExpression: function( str ) {
            return (str.charAt(0) == '<' || str.charAt(0) == '>');
        },

        /**
         * Splits the expression in into <|> [=] alias
         */
        splitExpression: function( str ) {

            // Used operator
            const operator = str.charAt(0);
            // Include breakpoint equal to alias?
            const orEqual  = (str.charAt(1) == '=') ? true : false;

            /**
             * Index at which breakpoint name starts.
             *
             * For:  >sm, index = 1
             * For: >=sm, index = 2
             */
            const index = 1 + (orEqual ? 1 : 0);

            /**
             * The remaining part of the expression, after the operator, will be treated as the
             * breakpoint name to compare with
             */
            const breakpointName = str.slice(index);

            return {
                operator:       operator,
                orEqual:        orEqual,
                breakpointName: breakpointName
            };
        },

        /**
         * Returns true if currently active breakpoint matches the expression
         */
        isAnyActive: function( breakpoints ) {
            let found = false;
            for (let i = 0; i < breakpoints.length; i++) {
                let $ele = document.querySelector('.device-' + breakpoints[i]);
                if (window.getComputedStyle($ele).display !== "none") {
                    found = true;
                    return true;
                }
            }
            return found;
        },

        /**
         * Determines whether current breakpoint matches the expression given
         */
        isMatchingExpression: function( str ) {

            const expression = internal.splitExpression( str );

            // Get names of all breakpoints
            const breakpointList = Object.keys(self.breakpoints);

            // Get index of sought breakpoint in the list
            let pos = breakpointList.indexOf( expression.breakpointName );

            // Breakpoint found
            if( pos !== -1 ) {

                let start = 0;
                let end   = 0;

                /**
                 * Parsing viewport.is('<=md') we interate from smallest breakpoint ('xs') and end
                 * at 'md' breakpoint, indicated in the expression,
                 * That makes: start = 0, end = 2 (index of 'md' breakpoint)
                 *
                 * Parsing viewport.is('<md') we start at index 'xs' breakpoint, and end at
                 * 'sm' breakpoint, one before 'md'.
                 * Which makes: start = 0, end = 1
                 */
                if( expression.operator == '<' ) {
                    start = 0;
                    end   = expression.orEqual ? ++pos : pos;
                }
                /**
                 * Parsing viewport.is('>=sm') we interate from breakpoint 'sm' and end at the end
                 * of breakpoint list.
                 * That makes: start = 1, end = undefined
                 *
                 * Parsing viewport.is('>sm') we start at breakpoint 'md' and end at the end of
                 * breakpoint list.
                 * Which makes: start = 2, end = undefined
                 */
                if( expression.operator == '>' ) {
                    start = expression.orEqual ? pos : ++pos;
                    end   = undefined;
                }

                const acceptedBreakpoints = breakpointList.slice(start, end);

                return internal.isAnyActive( acceptedBreakpoints );

            }
        }

    };

    // Public methods and properties
    const self = {

        /**
         * Determines default debouncing interval of 'changed' method
         */
        interval: 300,

        /**
         *
         */
        framework: null,

        /**
         * Breakpoint aliases, listed from smallest to biggest
         */
        breakpoints: null,

        /**
         * Returns true if current breakpoint matches passed alias
         */
        is: function( str ) {
            if (internal.isAnExpression( str )) {
                return internal.isMatchingExpression( str );
            }
            let $ele = document.querySelector('.device-' + str);
            return $ele && window.getComputedStyle($ele).display !== "none";
        },

        /**
         * Determines which framework-specific breakpoint detection divs to use
         */
        use: function( frameworkName, breakpoints ) {
            self.framework = frameworkName.toLowerCase();

            if ( self.framework === 'bootstrap' || self.framework === 'foundation') {
                self.breakpoints = internal.detectionDivs[ self.framework ];
            } else {
                self.breakpoints = breakpoints;
            }

            internal.applyDetectionDivs();
        },

        /**
         * Returns current breakpoint alias
         */
         current: function(){
             let name = 'unrecognized';
             for (const [key, value] of Object.entries(self.breakpoints)) {
                 if (self.is(key)) {
                     name = key;
                 }
             }
             return name;
         },

        /*
         * Waits specified number of miliseconds before executing a callback
         */
        changed: function(fn, ms) {
            let timer;
            return function(){
                clearTimeout(timer);
                timer = setTimeout(function(){
                    fn();
                }, ms || self.interval);
            };
        }

    };

    // Create a placeholder
    ready(function () {
        let $ele = document.createElement('div');
        $ele.classList.add('responsive-bootstrap-toolkit');
        document.body.appendChild($ele);
    });

    if( self.framework === null ) {
        self.use('bootstrap');
    }

    return self;

})(DocReady);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocReady;
    module.exports = ResponsiveBootstrapToolkit;
}
