// Your own scripts

(function(ready, document, window, viewport){

    var highlightBox = function( className ) {
        document.querySelector(className).classList.add('active');
    }

    var highlightBoxes = function() {
        let $boxes = document.querySelectorAll('.comparison-operator');
        for (let i = 0; i < $boxes.length; i++) {
            $boxes[i].classList.remove('active');
        }

        if (viewport.is("<=sm")) {
            console.log('less than sm');
            highlightBox('.box-1');
        }

        if (viewport.is("md")) {
            console.log('is md');
            highlightBox('.box-2');
        }

        if (viewport.is(">md")) {
            console.log('more than md');
            highlightBox('.box-3');
        }

        let $ele = document.querySelector('.current-break');
        $ele.innerHtml = viewport.current();
    }

    // Executes once whole document has been loaded
    ready(function() {
        highlightBoxes();
    });

    window.addEventListener('resize', viewport.changed(() => {
            highlightBoxes();
            let $ele = document.getElementById('viewport-width');
            $ele.innerHtml = window.innerWidth;
        })
    );

})(DocReady, document, window, ResponsiveBootstrapToolkit);
