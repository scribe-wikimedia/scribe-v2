( function () {
    /* Translate the following to your wiki language: */
    if ( !mw.messages.exists( 've-scribe-dialog-title' ) ) {
        mw.messages.set( {
        	've-scribe-add-reference-label': 'ADD',
        	've-scribe-add-reference-again-label': 'ADD AGAIN',
            've-scribe-dialog-title': 'Scribe',
            've-scribe-editing-ideas-txt': 'Editing Ideas?',
            've-scribe-launch-prompt-msg': 'Edit in Scribe Mode?',
            've-scribe-launch-scribe-accept': 'Yes',
            've-scribe-launch-scribe-deny': 'No',
            've-scribe-new-section-txt': 'New Section?',
            've-scribe-server-error': 'Unable to Reach Server Right now',
            've-scribe-search-score-label': 'Search score',
            've-scribe-suggested-sestion-txt': 'Suggested Sections',
            've-scribe-wikipedia-label': 'Wikipedia',
            've-scribe-wikipedia-domain-label': 'Wikipedia domain'
            
        } );
    }
/*  _____________________________________________________________________________
* |                                                                             |
* |                    === WARNING: GLOBAL GADGET FILE ===                      |
* |                  Changes to this page affect many users.                    |
* | Please discuss changes on the talk page or on [[WT:Gadget]] before editing. |
* |_____________________________________________________________________________|
* 
* Imported from version 0.0.1 as of 2019-11-04 from [[:en:MediaWiki:Gadget-scribe.js]]
* Using this script allows you to edit articles in underrepresented wikipedias, see [[User:Eugene233/scribe]]
*/

/* global mw, ve */
    var chosenReferences = [],
    	scribe = {},
    	sectionUrlTemplateData = [],
    	selectedSection = '',
    	slideIndex = 0;

    function createElement( type, id, className, displayText ) {
        var element;
        switch ( type ) {
            case 'p':
                element = $( '<p>' );
                element[ '0' ].id = id;
                element.addClass( className );
                element.append( displayText );
                break;
            case 'div':
                element = $( '<div>' );
                element[ '0' ].id = id;
                element.addClass( className );
                break;
            case 'span':
                element = $( '<span>' );
                element[ '0' ].id = id;
                element.addClass( className );
                element.append( displayText );
                break;
            case 'a':
                element = $( '<a>' );
                element[ '0' ].id = id;
                element.addClass( className );
                element.append( displayText );
                break;
            case 'ul':
                element = $( '<ul>' );
                element[ '0' ].id = id;
                element.addClass( className );
                element.append( displayText );
                break;
            case 'li':
                element = $( '<ul>' );
                element[ '0' ].id = id;
                element.addClass( className );
                element.append( displayText );
                break;
            default:
                break;
        }
        return element;
    }
    function addChild( parent, child ) {
        parent.append( child );
    }

    /**
     * Insert arbitrary content on VE surface
     *
     * @param {Object} surfaceModel the surface model
     * @param {Object} data the data to be written on surface
     */

    function insertContent( surfaceModel, data ) {
        // Insert data and place cursor afterwards
        surfaceModel.getFragment().collapseToEnd().insertContent( data ).collapseToEnd().select();
    }

	function buildEmptyParagraph() {
		return [ { type: 'paragraph' }, { type: '/paragraph' } ]
	}

    /**
     * Add write section to VE surface.
     */

    function writeSectionToSurface( sectionTextData ) {
        var surfaceModel = ve.init.target.getSurface().getModel(),
            ReferenceSectionData = [];
        ReferenceSectionData.push( { type: 'mwHeading', attributes: { level: 2 } } );
        sectionTextData.forEach( function ( character ) {
            ReferenceSectionData.push( character );
        } );
        ReferenceSectionData.push( { type: '/mwHeading' } );
        insertContent( surfaceModel, ReferenceSectionData );
        
        // add a new paragraph to create space
        insertContent( surfaceModel, buildEmptyParagraph() );
        selectedSection = sectionTextData;
    }

    /**
     * Swaps slides based on user operation
     * @param {Number} index - the index to display
     * @param {Object} slides - the slides in the reference section
     */

    function showSlide( slideIndex, slides ) {
        for ( var i = 0; i < slides.length; i++ ) {
            if ( i === slideIndex ) {
                slides[ i ].style.display = "block";
                $( '.ve-scribe-ref-box' ).addClass( 'activeref' );
            } else {
                slides[ i ].style.display = "none";
                $( '.ve-scribe-ref-box' ).removeClass( 'activeref' );
            }
        }
		if( slides[ slideIndex ].classList.contains( 'used-ref' ) ){
        	$( '#ve-scribe-choose-ref' )[ '0' ].innerHTML = mw.msg( 've-scribe-add-reference-again-label' )
        }else{
			$( '#ve-scribe-choose-ref' )[ '0' ].innerHTML = mw.msg( 've-scribe-add-reference-label' );
        }
    }

    /**
     * Add click event listener to the next button
     * @param {String} nextClass - class to add event listener.
     */

    function activeOnClickEventForNext( nextClass, slides ) {
        $( nextClass ).on( 'click', function () {
            if ( slideIndex === slides.length - 1 ) {
                slideIndex = -1;
            }
            slideIndex++;
            showSlide( slideIndex, slides );
        });
    }

    /**
     * Add click event listener to the previous button
     * @param {String} prevClass - class to add event listener.
     */

    function activeOnClickEventForPrev(prevClass, slides) {
        $( prevClass ).on( 'click', function () {
            if ( slideIndex - 1 < 0 ) {
                slideIndex = slides.length;
            }
            slideIndex--;
            showSlide( slideIndex, slides );
        } );
    }

    /**
     * Loads all references into the slider
     * @param {Object} slides - the slides to be added to ref section.
     */

    function loadAllReferenceSlides( slides ) {
        var i;
        for ( i = 0; i < slides.length; i++ ) {
            slides[ i ].style.display = "none";
            $( '.ve-scribe-ref-box' ).removeClass( 'activeref' );
        }
    }

    function createReferenceSlider( surface ) {
        var slider = createElement( 'div', 've-scribe-slider', 'slideshow-container', '' ),
            previousArrow = createElement( 'a', '', 'prev', '&#10094;' ),
            nextArrow = createElement( 'a', '', 'next', '&#10095;' );

        addChild( slider[ '0'], previousArrow[ '0' ] );
        addChild( slider[ '0' ], nextArrow[ '0' ]);
        surface.append( slider[ '0' ] );
        $( '#editing-ideas-tip' ).hide();
        $( '#ve-scribe-slider' ).hide();
    }

	/**
	 * Insert reference to VE surface
	 *
	 * @param {Object} surfaceModel the surface model
	 * @param {Object} data the data to be written
	 */

    function insertReference( surfaceModel, data ) {
        var origFragment = surfaceModel.getFragment();
        var referenceModel = new ve.dm.MWReferenceModel( surfaceModel.getDocument() );
        
        // Prepare and insert an empty reference
        referenceModel.insertInternalItem( surfaceModel );
        referenceModel.insertReferenceNode( origFragment.collapseToEnd() );

        // Find the contents of the reference inside the internal list
        var refContentsFragment = surfaceModel.getFragment(
            // Note: this assumes that the new reference contains an empty paragraph,
            // which should always be true
            new ve.dm.LinearSelection(referenceModel.findInternalItem(surfaceModel).getChildren()[0].getRange())
        );

        // Insert new content
        refContentsFragment.insertContent( data );

        // Place cursor after the inserted reference node
        origFragment.collapseToEnd().select();
    }

    /**
     * TODO: We have to use the URL to get the template data here like
     *       first, last publisher etc
     * @param {Object} sectionUrlTemplateData - the data from server of urls
     * @param {String} entryUrl - the particular chosen url
     * @return {Object} template - reference template for VE surface 
     */

    function builRefTemplate( SelectUrlData, selectUrl ) {
        // Server object of the form [publication_date, publication_title,publisher_name, retrieved_date]
        var first = SelectUrlData[ 2 ] != 'undefined' ? SelectUrlData[ 2 ] : '',
        	last = SelectUrlData[ 2 ] != 'undefined' ? SelectUrlData[ 2 ] : '',
        	title = SelectUrlData[ 1 ] != 'undefined' ? SelectUrlData[ 1 ] : '',
        	date = SelectUrlData[ 3 ] != 'undefined' ? SelectUrlData[ 3 ] : '',
			template = [
	            {
	                type: 'mwTransclusionInline',
	                attributes: {
	                    mw: {
	                        parts: [
	                            {
	                                template: {
	                                    target: {
	                                        href: './Template:Cite_web',
	                                        wt: 'Cite web'
	                                    },
	                                    params: {
	                                        first: { wt: first },
	                                        last: { wt: last },
	                                        title: { wt: title },
	                                        date: { wt: date },
	                                        url: { wt: selectUrl }
	                                    }
	                                }
	                            }
	                        ]
	                    }
	                }
	            },
	            { type: '/mwTransclusionInline' }
	        ];
        return template;
    }
	
	/**
	 * Sends post request to scribe server with stats data
	 **/

	function sendStatsData( statsData ){
		$.post( {
        url: 'https://tools.wmflabs.org/scribe/api/v1/stats',
        data: JSON.stringify( statsData ),
        contentType: 'application/json'
		    } ).done(function( response ) {
		    } ).fail( function( error ) {
		        console.log( "Error encountered: sendStatsData", error )
		    } )
	}

    function activateAddReferenceOnclickListerner( referenceAddButton, refDataNode, slides ) {
        referenceAddButton.on( 'click', function () {
            var selectRefData = [], selectedUrl, statsData = {},
                surfaceModel = ve.init.target.getSurface().getModel();

            $( '.ve-scribe-reference-slider-slides' )[ '0' ].childNodes.forEach( function (node) {
                if ( node.style.display === 'block' ) {
                    selectedUrl = node.firstChild.childNodes[ '2' ].innerHTML
                    selectRefData = node.firstChild.childNodes[ '4' ].innerHTML.split( '_' )
                }
            });

            // we build template for select link to cite on VE Surface
            templateData = builRefTemplate( selectRefData, selectedUrl );
            insertReference( surfaceModel, templateData );
            slides = $( '.ve-scribe-reference-slider-slides' )[ '0' ].childNodes;
            slides.forEach( function( slide ) {
            	if( slide.style.display === 'block' ){
            		slide.className = slide.className + ' used-ref';
            		$( '#ve-scribe-choose-ref' )[ '0' ].innerHTML = mw.msg( 've-scribe-add-reference-again-label' );
            	}	
            } );
            
            // send stats (references_used and section under edit) to the server side
            statsData.article = mw.config.get( 'wgTitle' );
            statsData.ref = selectedUrl;
            statsData.selectedSection = selectedSection.join( "" );
            sendStatsData( statsData )
        });
    }

    function activateCloseSliderOnclickListener( cancelSlider ) {
        cancelSlider.on( 'click', function () {
            $( '#ve-scribe-slider' ).hide();
        });
    }

    function buildSlideContent( sectionName ) {
        // sectionName not used at the moment 
        // sectionName = $('#editing-ideas-tip')['0'].childNodes['1'].id;
        
        var slideContent = createElement( 'div', '', 've-scribe-reference-slider-slides', '', '' ),
            cancelSlider = createElement( 'a', 've-scribe-cancel-ref-suggest', 'oo-ui-iconElement-icon oo-ui-icon-close', '' ),
            addRefLinnk = createElement( 'a', 've-scribe-choose-ref', '', 'ADD' );

        // remove previous slider if there was
        if ( $( '#ve-scribe-slider' ) ) {
            $( '#ve-scribe-slider' ).remove();
            createReferenceSlider( $( '.ve-ce-documentNode' )[ '0' ] );
        }

        $.get( 'https://tools.wmflabs.org/scribe/api/v1/references?section='+
        	sectionName + '&article=' + mw.config.get('wgTitle') )
            .then( function ( response ) {
                var resource = response.resources,
                	article_name = response.article_name;

                resource.forEach( function ( item ) {
                    // append the data to the slider display items
                    var sliderText = createElement( 'div', '', 've-scribe-slider-text', '' ),
                        refBox = createElement( 'div', '', 've-scribe-ref-box', '' ),
                        refTitle = createElement( 'span', '', 've-scribe-ref-title', item.publication_title ),
                        refText = createElement( 'span', '', 've-scribe-ref-text', item.content ),
                        refUrl = createElement( 'a', '', 've-scribe-ref-link', item.url),
                        refData = createElement( 'p', '', 've-scribe-ref-data', '' ),
                        refDomainData = createElement( 'span', '', 've-scribe-ref-domain-data', '' );

                    addChild(slideContent[ '0' ], sliderText[ '0' ] );
                    addChild(sliderText[ '0' ], refBox[ '0' ] );
                    addChild(refBox[ '0' ], refTitle[ '0' ] );
                    addChild(refBox[ '0' ], refText[ '0' ] );
                    addChild(refBox[ '0' ], refUrl[ '0' ] );
                    addChild(refBox[ '0' ], refDomainData[ '0' ] );
                    addChild(refBox[ '0' ], refData[ '0' ] );
		
                    $( '#ve-scribe-slider' )[ '0' ].append( slideContent[ '0' ] );
                    sliderText.hide();

                    // fill the ref-data node with the data from server for reference 
                    $.get( 'https://tools.wmflabs.org/scribe/api/v1/domain?link=' + item.url )
                    .done(
                        function ( data ) {
                        	var wp = mw.msg( 've-scribe-wikipedia-label' ) + ': ' + data.wikipedia_score, 
                        	wp_domain = mw.msg( 've-scribe-wikipedia-domain-label' ) + ': '  + data.wikipedia_score,
                        	black_list = mw.msg( 've-scribe-search-score-label' ) + ': ' + data.search_result_score;

                        	refDomainData[ '0' ].innerText = wp+ ' | ' + wp_domain + ' | ' + black_list;
                    });

                    // get the domain information for the particular reference url
                    $.get( 'https://tools.wmflabs.org/scribe/api/v1/references/resources?url=' + item.url )
                    .done(
                        function ( data ) {
                        	refData[ '0' ].innerHTML =
                                data.publication_date + '_' +
                                data.publication_title + '_' +
                                data.publisher_name + '_' +
                                data.retrieved_date;
                        }
                    );
                    refData.hide();
                } );
                addChild( $( '#ve-scribe-slider' )[ '0' ], addRefLinnk[ '0' ] );
                addChild( $( '#ve-scribe-slider' )[ '0' ], cancelSlider[ '0' ] );

                var slides = $( '#ve-scribe-slider' )[ '0' ].childNodes[ '2' ].childNodes;
                loadAllReferenceSlides( slides );

                // display the first reference data in the slides
                slides[ '0' ].style.display = 'block';

                //activate onClick listener for prev and net
                activeOnClickEventForNext( '.next', slides );
                activeOnClickEventForPrev( '.prev', slides );
                slideIndex = 0;

                // activate ADD on click Listener
                activateAddReferenceOnclickListerner( $( '#ve-scribe-choose-ref' ), slides );
                activateCloseSliderOnclickListener( $( '#ve-scribe-cancel-ref-suggest' ) );
            },
            // error routine
	        function( error ) {
	           // hide the slider since there is no ref data
	           $( '#ve-scribe-slider' ).hide()
	           OO.ui.alert( mw.msg( 've-scribe-server-error' ) ).done(function () {
	        } );	
        } );
    }

    function addEditTipOnclickListener( sectionIdeasTip, surface ) {
        sectionIdeasTip.on( 'click', function () {
            //hide the new section tip tag
            $( '#editing-ideas-tip' ).hide();

            // populate the reference slider with data from server
            buildSlideContent( $( '#editing-ideas-tip' )[ '0' ] )
            // $( '#ve-scribe-slider' )[ '0' ].prepend( buildSlideContent( sectionName )[ '0' ] );
            $( '#ve-scribe-slider' ).show();
            $( '#ve-scribe-show-header-icon' ).hide()
        });
    }

    function ShowEditIdeaTip( surface ) {
        var tipSpan = createElement( 'span', 'editing-ideas-tip', '', '' ),
        	tipIcon = createElement( 'span', '', '', '' ),
            tipText = createElement( 'a', '', 've-scribe-sm-suggest-text', mw.msg( 've-scribe-editing-ideas-txt' ) );
        addChild( tipSpan[ '0' ], tipIcon[ '0' ] );
        addChild( tipSpan[ '0' ], tipText[ '0' ] );
        surface.append( tipSpan[ '0' ] );

        addEditTipOnclickListener( $( '#editing-ideas-tip' ), surface );
        $( '#ve-scribe-new-section-tip' ).hide();
        createReferenceSlider( surface );
    }

    function addSectionItemOnclickListener( sectionContainer, surface ) {
        var sectionContainerElements = sectionContainer[ '0' ].childNodes;
        if ( sectionContainerElements.length != 0 ) {
            sectionContainerElements.forEach( function ( section ) {
                var seectionId = section.firstChild.id;
                $( '#' + seectionId ).on( 'click', function () {

                    // indicate that the section has been clicked -- change color
                    $( '#' + seectionId ).addClass( 'active-seection' );
                    // we have to write the section title into the ve surface here
                    var sectionTextData = $( '#' + seectionId )[ '0' ].firstChild.data.split( '' );
                    writeSectionToSurface( sectionTextData );
                    
                    $( '#editing-ideas-tip' ).show();
                    // hide reference panel
                    $( '#ve-scribe-slider' ).hide();
                    $( '#editing-ideas-tip' )[ '0' ].childNodes[ '1' ].id = $( '#' + seectionId )[ '0' ].firstChild.data;
                } );
            } );
        }
    }
    
    function addShowScribeHeaderMenuOnclickListener( expandScribeHeaderMenu ) {
    	expandScribeHeaderMenu.on( 'click', function() {
    		$( '#ve-scribe-show-header-icon' ).hide()
    		$( '#ve-scribe-sm-header' ).slideDown();
    	} );
    }

	function addHideScribeHeaderMenuOnclickListener( collapseScribeHeaderIcon, mobileHeader ) {
		collapseScribeHeaderIcon.on( 'click', function(){
			$( '#ve-scribe-sm-header' ).slideUp();
			$( '#ve-scribe-show-header-icon' ).show()
		} );
	}

    function buildScribeHeader( mobileHeader, surface ) {
        var header = createElement( 'div', 've-scribe-sm-header', 'header', '' ),
            tagContainer = createElement( 'span', 've-scribe-sm-idea-label', '', '' ),
            sectionHeaderIcon = createElement( 'span', 've-scribe-header-tip-icon', 'oo-ui-iconElement-icon oo-ui-icon-bell', '' ),
            collapseScribeHeaderIcon = createElement( 'span', 've-scribe-hide-header-icon',
            										 'oo-ui-indicatorElement-indicator oo-ui-indicator-up', '' ),
            expandScribeHeaderIcon = createElement( 'span', 've-scribe-show-header-icon',
            									   'oo-ui-indicatorElement-indicator oo-ui-indicator-down', '<p>Scribe</p>' ),
            sectionHeaderText = createElement( 'span', '', 've-scribe-sm-suggest-text',
            								  mw.msg( 've-scribe-suggested-sestion-txt' ) ),
            sectionTagList = createElement( 'ul', 've-scribe-section-container', 'tags-container', '' );
	    
        // Each section should appear as a tagListItem
        $.get( 'https://tools.wmflabs.org/scribe/api/v1/sections?article=' + mw.config.get( 'wgTitle' ) )
            .then( function ( data ) {
				var articleSections = data.parse.sections;

        		// hide loader: when data is fetched
            	$( '#scribe-pg-bar' ).hide()

                articleSections.forEach( function ( section ) {
                    var sectionTagListItem = createElement( 'li',
                        '', 'tags',
                        '<a class="tag" id="section-' + section.number + '">' +
                        section.line + '</a>' );

                    // add the sections in to the container
                    addChild(sectionTagList[ '0' ], sectionTagListItem[ '0' ] );
                });

                // If the request does not complete we don't add anything to interface
                addChild( tagContainer[ '0' ], sectionHeaderIcon[ '0' ] );
                addChild( tagContainer[ '0' ], sectionHeaderText[ '0'] );
                addChild( tagContainer[ '0' ], collapseScribeHeaderIcon[ '0' ] );
                addChild( header[ '0' ], tagContainer[ '0' ] );
                addChild( header[ '0' ], sectionTagList[ '0' ] );

                mobileHeader.append( expandScribeHeaderIcon[ '0' ] );
                mobileHeader.append( header[ '0' ] );
				
                // set every section's onclick listener using the container
                addSectionItemOnclickListener( sectionTagList, surface );
                addHideScribeHeaderMenuOnclickListener( collapseScribeHeaderIcon, mobileHeader );
                addShowScribeHeaderMenuOnclickListener( expandScribeHeaderIcon, mobileHeader );
                expandScribeHeaderIcon.hide();
            },	
            
            // error routine
			// give feedback to user
	        function( error ) {
	        	// hide the loader: Nothing happened
            	$( '#scribe-pg-bar' ).hide()
            	// display error message to client
	        	OO.ui.alert( mw.msg( 've-scribe-server-error') ).done( function () {
	        	} );
	        } );
    }

	function buildScribeLoader() {
		return new OO.ui.ProgressBarWidget( {
			progress: false,
			id: 'scribe-pg-bar'
		} )
	}

    function addNewSectionTipOnclickListener( sectionIdeasTip, surface, mobileHeader ) {
        sectionIdeasTip.on( 'click', function () {
            //hide the new section tip tag
            sectionIdeasTip.hide();

            //display header with sections
            buildScribeHeader( mobileHeader, surface );
			
			$( '#scribe-pg-bar' ).show()
			
            // display the edit tips tag
            ShowEditIdeaTip( surface );

            //hide the edit tip tag
            $( '#editing-ideas-tip' ).hide();
        } );
    }

    function showNewSectionTip( surface ) {
        var tipSpan = createElement( 'span', 've-scribe-new-section-tip', 'editing-tip', '' ),
            tipText = createElement( 'a', 'editing-idea-link', 've-scribe-sm-suggest-text',
            						mw.msg( 've-scribe-new-section-txt' ) );
        addChild( tipSpan[ '0' ], tipText[ '0' ] );

		var scribeLoader = buildScribeLoader();
		surface.prepend( scribeLoader.$element )
	    
        surface[ '0' ].append( tipSpan[ '0' ] );
        addNewSectionTipOnclickListener( $( '#ve-scribe-new-section-tip' ), surface[ '0' ], mobileHeader );
    }

    mw.hook( 've.activationComplete' ).add( function () {

        OO.ui.confirm( mw.msg( 've-scribe-launch-prompt-msg' ),
            {
                actions: [
                    {
                        action: 'accept',
                        label: mw.msg( 've-scribe-launch-scribe-accept' ),
                        flags: [ 'primary', 'progressive' ]
                    },
                    { action: 'reject', label: mw.msg( 've-scribe-launch-scribe-deny' ) }
                ]
            }
        ).done( function ( confirmed ) {
            if ( confirmed ) {
                var surface = $( '.ve-init-mw-desktopArticleTarget-originalContent' );
                mobileHeader = $( '.oo-ui-toolbar-bar' )[ '0' ];
                showNewSectionTip( surface, mobileHeader );
      
                // hide the loader inititally
                $( '#scribe-pg-bar' ).hide()
            }
        } );
    } );
} () );

