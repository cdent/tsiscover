$(function() {
	var SPACE_TAGS = [
		'translation',
		'plugin',
		'language',
		'theme',
		'image'],
		space_tags = SPACE_TAGS.concat(['languages']),
		search = '/search?q=title:SiteInfo%20(tag:' + space_tags.join('%20OR%20tag:') + ')_limit:9999',
		lumpSource = $('#slide-lump').html(),
		lumpTemplate = Handlebars.compile(lumpSource);
		infoSource = $('#siteinfo').html(),
		infoTemplate = Handlebars.compile(infoSource);

	$.ajaxSetup({
		beforeSend: function(xhr) {
			xhr.setRequestHeader("X-ControlView", "false");
		}
	});

	function renderTiddler(uri) {
		uri = uri.replace(/^.*?\/bags/, '/bags');
		$.ajax({
			url: uri + '?render=1',
			dataType: 'json',
			success: function(tiddler) {
				$('#siteinfotext').html(tiddler.render);
			}
		});
	}

	function viewSiteInfo(event) {
		event.stopPropagation();
		var uri = $(this).attr('data-uri').replace(/bags\/.*$/, ''),
			site = infoTemplate({
			space: $(this).attr('data-space'),
			render: 'loading...',
			uri: uri
		});
		$('body').append(site);
		$('#sitemodal').on('hidden', function() { this.remove(); });
		$('#sitemodal').modal('show');
		renderTiddler($(this).attr('data-uri'));
		return false;
	}

	function presentTiddlers(tiddlers) {
		var tags = {};
		$.each(tiddlers, function(index, tiddler) {
			$.each(tiddler.tags, function(index, tag) {
				if (tag === 'languages') {
					tag = 'language';
				}
				if ($.inArray(tag, SPACE_TAGS) !== -1) {
					var li = $('<li>'),
						space = tiddler.bag.replace(/_public$/, ''),
						link = $('<a>')
						.text(space)
						.attr('href', tiddler.uri)
						.attr('data-uri', tiddler.uri)
						.attr('data-space', space)
						.on('click', viewSiteInfo);
					li.append(link);
					$('#' + tag).append(li);
				}
			});
		});
	}

	function errorHandle(xhr, txtStatus, err) {
		console.log('error', xhr, txtStatus, err);
	}
	
	function drawPage() {
		var container = $('#data'),
			cleanEnd = true,
			current;

		$.each(SPACE_TAGS, function(index, tag) {
			var lump = lumpTemplate({tag: tag});
			if (index % 3 == 0) {
				current = $('<div class="row-fluid">');
			}
			current.append(lump);
			if (index % 3 == 2) {
				container.append(current);
				cleanEnd = true;
			} else {
				cleanEnd = false;
			}
		});
		if (!cleanEnd) {
			container.append(current);
		}
	}

	$.ajax({
		url: search,
		dataType: 'json',
		success: presentTiddlers,
		error: errorHandle,
	});
	drawPage();
			
}());
