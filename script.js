/* ==========================================================================
   Copyright 2012 syssgx (http://github.com/syssgx)
 
   Code licensed under CC BY 3.0 licence
   http://creativecommons.org/licenses/by/3.0/
   ========================================================================== */
 
$(document).ready(function() {
	"use strict";
	
	var xmlData = 0, schemaData = 0,
		xmlFileName, schemaFileName;
	
	function handleFile(e) {
		
		var fileObject = e.originalEvent.dataTransfer,
			files = fileObject.files,
		    outputdiv, filestring;
			
		outputdiv = "#" + $(this).attr("id");
		
		ignoreDrag(e);
		
		for (var i = 0; i<files.length; i++) {
			var f = files[i];
			var filereader = new FileReader();

			filestring = "<strong>" + escape(f.name) + 
							"</strong> (" + (f.type || "n/a") + "): " + f.size + " bytes - " + 
							"<strong>last modified:</strong> " + (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : "n/a");
			filereader.readAsText(f);
			filereader.onload = (function(theFile) {
				return function(e) {
					if (outputdiv.substr(1,3) === "xml") {
						xmlData = e.target.result;
						xmlFileName = f.name;
					} else {
						schemaData = e.target.result;
						schemaFileName = f.name;
					}
				};
			})(f);
		}

		$(outputdiv).html(filestring).css("background", "#B9B9F4").css("border", "2px solid #2222D3");
	}
	
	function ignoreDrag(e) {
		e.originalEvent.stopPropagation();
		e.originalEvent.preventDefault();
	}
	
	$('#xml_file').bind('dragenter', ignoreDrag).bind('dragover', ignoreDrag).bind('drop', handleFile);
	$('#schema_file').bind('dragenter', ignoreDrag).bind('dragover', ignoreDrag).bind('drop', handleFile);	

	$('#form').submit(function(event){
		$('#result').text("Processing.. Depending on xml size, it might take a while. Page will not be responsive during the process");
		var Module = {
			xml: xmlData,
			schema: schemaData,
		};
		var result = xmllint.validateXML(Module).errors;
		console.log(result);
		$('#result').text(result);
		event.preventDefault();
	});

	try {
	// load schema
		$.ajax({
			url: "https://admarkt.marktplaats.nl/api/sellside/feed/xsd",
			contentType: 'text/plain',
			xhrFields: {
	    		withCredentials: false
	  		},
		})
		.done(function(data) { 
			schemaData = data;
			$('#result').html("loaded XSD schema");
		})
		.failed(function(xhr, msg, err) { 
			$('#result').html("failed to load XSD schema");
			console.log(msg, err);
		})
	} catch(err) {
		schemaData = xsdFallback;
		console.log(err);
	}
});