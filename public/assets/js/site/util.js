function get_id_from_url()
{
	var is_parseInt = (arguments.length > 0) ? arguments[0] : true;

	var id = url('-1');
	if (is_parseInt) id = parseInt(id);

	return id;
}

function get_id_num(id_string)
{
	if (typeof id_string === "undefined") return false;

	var matches = id_string.match(/^[a-z0-9_]+_(\d+)$/i);
	if (matches) return matches[1];

	return false;
}

function get_url(uri)
{
	return get_baseUrl() + uri;
}

function set_token()
{
	var obj = (arguments.length > 0) ? arguments[0] : false;
	var token_key = get_token_key();

	if (obj == false) {
		return token_key + '=' + get_token();
	} else {
		obj[token_key] = get_token();
		return obj;
	}
}

function redirect(uri)
{
	location.href = get_url(uri);
}

function get_error_message(status)
{
	var default_message = (arguments.length > 1) ? arguments[1] : '';

	switch (status)
	{
		case 401:
			return '認証情報の取得に失敗しました。ログイン後、再度実行してください。';
		default :
			return default_message;
	}
}

function showMessage(msg)
{
	$.jGrowl(msg);
}

function get_loading_image_tag()
{
	var isEncloseBlock = (arguments.length > 0) ? arguments[0] : false;
	var blockSelector = (arguments.length > 1) ? arguments[1] : '';

	var imageTag = '<img src="' + get_url('assets/img/loading.gif') + '">';
	if (!isEncloseBlock) return imageTag;

	var blockTag = '<div class="loading_image"'
	if (blockSelector) blockTag += ' id="' + blockSelector + '"';
	blockTag += '>' + imageTag + '</div>';

	return blockTag;
}

function removeLoadingBlock()
{
	var loadingBlockId = (arguments.length > 0) ? arguments[0] : '';

	if (loadingBlockId) {
		$('#' + loadingBlockId).remove();
		return;
	}

	$('.loading_image').remove();
}

function setLoading(blockSelector)
{
	var trigerSelector = (arguments.length > 1) ? arguments[1] : '';
	var loadingBlockSelector = (arguments.length > 2) ? arguments[2] : '';

	if (trigerSelector) {
		$(trigerSelector).attr('disabled', true);
		$(trigerSelector).html(get_loading_image_tag(true, loadingBlockSelector));
	} else {
		$(blockSelector).append(get_loading_image_tag(true, loadingBlockSelector));
	}
}

function removeLoading(blockSelector)
{
	var trigerSelector = (arguments.length > 1) ? arguments[1] : '';
	var loadingBlockId = (arguments.length > 2) ? arguments[2] : '';
	var isRemoveTrigerSelector = (arguments.length > 3) ? Boolean(arguments[3]) : false;

	if (trigerSelector) {
		$(trigerSelector).attr('disabled', false);
		if (isRemoveTrigerSelector) {
			$(trigerSelector).remove();
			return;
		}
	}
	removeLoadingBlock(loadingBlockId);
}

function loadList(getUri, parentListSelector) {
	var limit            = (arguments.length > 2) ? parseInt(arguments[2]) : 0;
	var nextItemSelector = (arguments.length > 3) ? arguments[3] : '';
	var isInsertBefore   = (arguments.length > 4) ? arguments[4] : false;
	var trigerSelector   = (arguments.length > 5) ? arguments[5] : '';
	var getData          = (arguments.length > 6) ? arguments[6] : {};

	getData['limit'] = limit ? limit : get_config('default_list_limit');

	var lastId =  (nextItemSelector && $(nextItemSelector).data('id')) ? parseInt($(nextItemSelector).data('id')) : 0;
	if (lastId) getData['last_id'] = lastId;

	$.ajax({
		url : get_url(getUri),
		type : 'GET',
		dataType : 'text',
		data : getData,
		timeout: get_config('default_ajax_timeout'),
		beforeSend: function(xhr, settings) {
			GL.execute_flg = true;
			setLoading(parentListSelector, trigerSelector, 'list_loading_image');
		},
		complete: function(xhr, textStatus) {
			GL.execute_flg = false;
			removeLoading(parentListSelector, trigerSelector, 'list_loading_image', true);
		},
		success: function(result) {
			if (nextItemSelector) {
				if (isInsertBefore) {
					$(nextItemSelector).before(result).fadeIn('fast');
				} else {
					$(nextItemSelector).after(result).fadeIn('fast');
				}
			} else {
				$(parentListSelector).html(result).fadeIn('fast');
			}
			//$(parentListSelector).find('textarea').autogrow();
		},
		error: function(result) {
			showMessage(get_error_message(result['status'], '読み込みに失敗しました。'));
		}
	});
}

function delete_item(uri)
{
	var id = (arguments.length > 1) ? arguments[1] : 0;
	var target_attribute_prefix = (arguments.length > 2) ? arguments[2] : '';
	var target_attribute_id = (arguments.length > 3) ? arguments[3] : '';
	var item_term = (arguments.length > 4) ? arguments[4] : '';
	var confirm_msg = (arguments.length > 5 && arguments[5].length > 0) ? arguments[5] : '削除します。よろしいですか?';

	apprise(confirm_msg, {'confirm':true}, function(r) {
		if (r == true) delete_item_execute_ajax(uri, id, target_attribute_prefix, target_attribute_id, true, item_term);
	});
}

function delete_item_execute(uri)
{
	var url = get_url(uri) + '?' + set_token();
	location.href = url;
}

function delete_item_execute_ajax(post_uri, id, target_attribute_prefix)
{
	var target_attribute_id = (arguments.length > 3) ? arguments[3] : '';
	var is_display_message_success = (arguments.length > 4) ? arguments[4] : true;
	var item_term = (arguments.length > 5) ? arguments[5] : '';

	var baseUrl = get_baseUrl();

	var token_key = get_token_key();
	var post_data = {};
	if (id) post_data['id'] = id;
	post_data['_method'] = 'DELETE';
	post_data[token_key] = get_token();

	var msg_prefix = '';
	if (item_term.length > 0) msg_prefix = item_term + 'を';

	$.ajax({
		url : baseUrl + post_uri,
		dataType : "text",
		data : post_data,
		type : 'POST',
		success: function(data){
			var delete_target_attribute = target_attribute_id ? target_attribute_id : target_attribute_prefix + '_' + id;
			$(delete_target_attribute).fadeOut();
			$(delete_target_attribute).remove();
			if (is_display_message_success) $.jGrowl(msg_prefix + '削除しました。');
		},
		error: function(data){
			$.jGrowl(get_error_message(data['status'], msg_prefix + '削除できませんでした。'));
		}
	});
}

function reset_textarea()
{
	var textareaSelector = (arguments.length > 0) ? arguments[0] : 'textarea';
	var textareaHeight   = (arguments.length > 1) ? arguments[1] : '';
	if (!textareaHeight) textareaHeight = get_config('default_form_comment_textarea_height');

	$(textareaSelector).val('');
	$(textareaSelector).css('height', textareaHeight);
}

function getNextSelector(listSelector, isInsertBefore)
{
	var nextElement = '';
	if ($(listSelector).html().replace(/[\r\n\s]+/, '')) {
		var position = isInsertBefore ? 'first' : 'last';
		nextElement = $(listSelector + ' > div:' + position);
	}
	return nextElement ? '#' + nextElement.attr('id') : '';
}

function postComment(postUri, textareaSelector, getUri, listSelector)
{
	var nextItemSelector  = (arguments.length > 4) ? arguments[4] : '';
	var isInsertBefore    = (arguments.length > 5) ? arguments[5] : false;
	var trigerSelector    = (arguments.length > 6) ? arguments[6] : '';
	var postData          = (arguments.length > 7) ? arguments[7] : {};
	var isCheckInput      = (arguments.length > 8) ? arguments[8] : true;
	var postedArticleTerm = (arguments.length > 9) ? arguments[9] : '';
	var getData           = (arguments.length > 10) ? arguments[10] : {};
	var textareaHeight    = (arguments.length > 11) ? arguments[11] : '33px';

	if (GL.execute_flg) return false;
	if (!postUri) return false;

	var body = $(textareaSelector).val().trim();
	if (isCheckInput && !body.length) return;
	postData['body'] = body;
	postData = set_token(postData);

	if (!postedArticleTerm) postedArticleTerm = get_term('comment');
	var trigerSelectorHtml = (trigerSelector) ? $(trigerSelector).html() : '';

	$.ajax({
		url : get_url(postUri),
		type : 'POST',
		dataType : 'text',
		data : postData,
		timeout: get_config('default_ajax_timeout'),
		beforeSend: function(xhr, settings) {
			GL.execute_flg = true;
			setLoading(listSelector, trigerSelector, 'btn_loading_image');
		},
		complete: function(xhr, textStatus) {
			GL.execute_flg = false;
			removeLoading(listSelector, trigerSelector, 'btn_loading_image');
			if (trigerSelector) $(trigerSelector).html(trigerSelectorHtml);
		},
		success: function(result){
			$.jGrowl(postedArticleTerm + 'を投稿しました。');
			loadList(getUri, listSelector, 0, nextItemSelector, isInsertBefore, '', getData);
			//if (count_attribute && $(count_attribute) != null) {
			//	var count = parseInt($(count_attribute).html()) + 1;
			//	$(count_attribute).html(count);
			//}
			reset_textarea(textareaSelector, textareaHeight);
		},
		error: function(result){
			$.jGrowl(get_error_message(result['status'], postedArticleTerm + 'の投稿に失敗しました。'));
		}
	});
}

function set_datetimepicker(attribute)
{
	var is_accept_futer = (arguments.length > 1) ? arguments[1] : false;
	$(attribute).datetimepicker({
		dateFormat: 'yy-mm-dd',
		hourMax: 23,
		changeYear: true,
		changeMonth: true,
		prevText: '&#x3c;前',
		nextText: '次&#x3e;',
		timeFormat: 'HH:mm',
		hourGrid: 6,
		minuteGrid: 15,
		addSliderAccess: true,
		sliderAccessArgs: { touchonly: false },
		maxDateTime: is_accept_futer ? null : new Date()
	});
}

function load_item(container_attribute, item_attribute)
{
	var finished_msg = (arguments.length > 2) ? arguments[2] : '';
	var loading_image_url = (arguments.length > 3) ? arguments[3] : get_url('assets/img/site/loading_l.gif');

	var $container = $(container_attribute);
	$container.infinitescroll({
		navSelector  : '#page-nav',   // ページのナビゲーションを選択
		nextSelector : '#page-nav a', // 次ページへのリンク
		itemSelector : item_attribute,    // 持ってくる要素のclass
		loadingImg   : loading_image_url,
	});
}

function load_popover(link_attribute, content_attribute, content_url) {
	var input_attrs = (arguments.length > 3) ? arguments[3] : '';

	$(link_attribute).popover({html: true})
	$(link_attribute).click(function(){
		$(content_attribute).load(content_url);
		//if (input_attrs.length > 0) $(input_attrs).focus();
		$(window).resize(function(e) {
			e.preventDefault()
			$(link_attribute).each(function (){
				if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('a[data-toggle=popover]').has(e.target).length === 0 && check_is_input(input_attrs) === false) {
					$(this).popover('hide');
					return;
				}
			});
		});
		return false;
	})
}

function update_public_flag(selfDomElement) {
	var public_flag          = $(selfDomElement).data('public_flag');
	var public_flag_original = $(selfDomElement).data('public_flag_original') ? $(selfDomElement).data('public_flag_original') : null;

	if (public_flag_original != null && is_expanded_public_range(public_flag_original, public_flag)) {
		apprise('公開範囲が広がります。実行しますか？', {'confirm':true}, function(r) {
			if (r == true) check_is_update_children_public_flag_before_update(selfDomElement);
		});
	} else {
		check_is_update_children_public_flag_before_update(selfDomElement);
	}

	return false;
}

function check_is_update_children_public_flag_before_update(selfDomElement) {
	var model = $(selfDomElement).data('model');
	var model = $(selfDomElement).data('child_model');
	var have_children_public_flag = $(selfDomElement).data('have_children_public_flag') ? $(selfDomElement).data('have_children_public_flag') : 0;
	var child_model = $(selfDomElement).data('child_model') ? $(selfDomElement).data('child_model') : '';

	if (have_children_public_flag) {
		apprise(get_term(child_model) + 'の' + get_term('public_flag') + 'も変更しますか？', {'verify':true}, function(r) {
			if (r == true) {
				update_public_flag_execute(selfDomElement, 1);
			} else {
				update_public_flag_execute(selfDomElement);
			}
		});
	} else {
		update_public_flag_execute(selfDomElement);
	}

	return false;
}

function update_public_flag_execute(selfDomElement) {
	var is_update_children_public_flag = (arguments.length > 1) ? arguments[1] : 0;
	var id          = $(selfDomElement).data('id');
	var model       = $(selfDomElement).data('model');
	var public_flag = $(selfDomElement).data('public_flag');
	var model_uri   = $(selfDomElement).data('model_uri');
	var post_uri       = $(selfDomElement).data('post_uri')  ? $(selfDomElement).data('post_uri')  : '';
	var icon_only_flag = $(selfDomElement).data('icon_only') ? $(selfDomElement).data('icon_only') : 0;
	var have_children_public_flag = $(selfDomElement).data('have_children_public_flag') ? $(selfDomElement).data('have_children_public_flag') : 0;
	var child_model    = $(selfDomElement).data('child_model') ? $(selfDomElement).data('child_model') : '';
	var is_refresh     = $(selfDomElement).data('is_refresh')  ? $(selfDomElement).data('is_refresh')  : 0;
	var is_no_msg      = $(selfDomElement).data('is_no_msg')   ? $(selfDomElement).data('is_no_msg')   : 0;

	var text = $(selfDomElement).html();
	var parentElement = $(selfDomElement).parent('li');
	var buttonElement = $(parentElement).parents('div.btn-group');

	var post_data = {
		'id'             : id,
		'public_flag'    : public_flag,
		'model'          : model,
		'icon_only_flag' : icon_only_flag,
		'have_children_public_flag'      : have_children_public_flag,
		'is_update_children_public_flag' : is_update_children_public_flag,
	};
	uri = post_uri ? post_uri : model_uri +'/api/update_public_flag.html';
	post_data = set_token(post_data);
	$.ajax({
		url : get_baseUrl() + uri,
		type : 'POST',
		dataType : 'text',
		data : post_data,
		beforeSend: function(xhr, settings) {
			GL.execute_flg = true;
			$(selfDomElement).remove();
			$(parentElement).html('<span>' + get_loading_image_tag( + '</span>'));
		},
		complete: function(xhr, textStatus) {
			GL.execute_flg = false;
		},
		success: function(result, status, xhr){
			$(buttonElement).html(result);
			$(buttonElement).removeClass('open');
			var msg = is_no_msg ? '' : get_term('public_flag') + 'を変更しました。';
			if (is_refresh) {
				var query_strring = '';
				if (msg.length > 0) {
					var delimitter = (url('?').length > 0) ? '&' : '?';
					query_strring = delimitter + 'msg=' + msg;
				}
				location.href=url() + query_strring;
			} else {
				if (msg.length > 0) $.jGrowl(msg);
			}
		},
		error: function(result){
			$(parentElement).html(selfDomElement);
			//var resData = $.parseJSON(result.responseText);
			//var message = resData.error.message ? resData.error.message : get_term('public_flag') + 'の変更に失敗しました。';
			//$.jGrowl(get_error_message(result['status'], message));
			$.jGrowl(get_error_message(result['status'], get_term('public_flag') + 'の投稿に失敗しました。'));
		}
	});
}

function is_expanded_public_range(original_public_flag, changed_public_flag) {
	if (typeof changed_public_flag === "undefined") return false;
	if (original_public_flag == changed_public_flag) return false;
	if (original_public_flag == 0) return true;
	if (changed_public_flag == 0) return false;
	if (original_public_flag > changed_public_flag) return true;

	return false;
}

function get_public_flag_select_button_html(selected_value) {
	var is_label_only      = (arguments.length > 1) ? arguments[1] : false;
	var without_parent_box = (arguments.length > 2) ? arguments[2] : false;

	var selected_key = String(selected_value);
	var items = get_public_flags();

	var html = '';
	if (!without_parent_box) html += '<div class="btn-group public_flag pull-right">' + "\n";
	html += '<button class="btn dropdown-toggle btn-mini ' + items[selected_key]['btn_color'] + '" id="public_flag_selector" data-toggle="dropdown">' + "\n";
	html += items[selected_key]['icon'];
	if (!is_label_only) html += items[selected_key]['name'];
	html += '<span class="caret"></span>' + "\n";
	html += '</button>' + "\n";
	html += '<ul class="dropdown-menu">' + "\n";
	$.each(items, function(i, val) {
		var key = String(i);
		if (key == selected_key) {
			html += '<li><span class="disabled">' + items[key]['icon'] + items[key]['name'] + '</span></li>' + "\n";
		} else {
			html += '<li><a href="#" class="select_public_flag" data-public_flag="' + key + '" >' + items[key]['icon'] + items[key]['name'] + '</a></li>' + "\n";
		}
	});
	html += '</ul>' + "\n";
	if (!without_parent_box) html += '</div>' + "\n";

	return html;
}

function setup_simple_validation_required_popover(input_atter) {
	$(input_atter).popover({
		placement: 'bottom',
		content: 'このフィールドは必須入力です。',
		trigger: 'manual',
		animation: true,
		delay: { show: 500, hide: 100 }
	});
}

function simple_validation_required(input_atter) {
	var input_val = $(input_atter).val().trim();

	if (input_val.length == 0) {
		$(input_atter).popover('show');
		isPopover = true;
		return false;
	}
	return true;
}

function check_is_input(input_attrs) {
	var is_input = false;
	for (i = 0; i < input_attrs.length; i++) {
		var val = $(input_attrs[i]).val();
		if(val && val.length > 0) is_input = true;
	}

	return is_input;
}

function load_masonry_item(container_attribute, item_attribute)
{
	var load_more    = (arguments.length > 2) ? arguments[2] : true;
	var finished_msg = (arguments.length > 3) ? arguments[3] : '';
	var loading_image_url = (arguments.length > 4) ? arguments[4] : get_url('assets/img/site/loading_l.gif');

	var $container = $(container_attribute);
	$container.imagesLoaded(function(){
		$container.masonry({
			itemSelector : item_attribute,
			isFitWidth: true,
			isAnimated: true,
			animationOptions: {
					duration: 400
			}
		});
	});
	if (load_more) {
		$container.infinitescroll({
			navSelector  : '#page-nav',   // ページのナビゲーションを選択
			nextSelector : '#page-nav a', // 次ページへのリンク
			itemSelector : item_attribute,    // 持ってくる要素のclass
			loading: {
					finishedMsg: finished_msg, //次のページがない場合に表示するテキスト
					img: loading_image_url //ローディング画像のパス
				}
			},
			// trigger Masonry as a callback
			function( newElements ) {
				var $newElems = $( newElements ).css({ opacity: 0 });
				$newElems.imagesLoaded(function(){
					$newElems.animate({ opacity: 1 });
					$container.masonry( 'appended', $newElems, true );
				});
			}
		);
	}
}

function send_article(btnObj, post_data, post_uri, parent_box_attr) {
	var add_before  = (arguments.length > 4 && arguments[4]) ? arguments[4] : false;
	var msg_success = (arguments.length > 5 && arguments[5]) ? arguments[5] : '投稿に成功しました。';
	var msg_error   = (arguments.length > 6 && arguments[6]) ? arguments[6] : '投稿に失敗しました。';

	post_data = set_token(post_data);
	var btn_html = $(btnObj).html();
	$.ajax({
		url : get_url(post_uri),
		type : 'POST',
		dataType : 'text',
		data : post_data,
		timeout: 10000,
		beforeSend: function(xhr, settings) {
			GL.execute_flg = true;
			$(btnObj).attr('disabled', true);
			$(btnObj).html(get_loading_image_tag());
		},
		complete: function(xhr, textStatus) {
			GL.execute_flg = false;
			$(btnObj).attr('disabled', false);
			$(btnObj).html(btn_html);
		},
		success: function(result) {
			if (add_before) {
				$(parent_box_attr).prepend(result).fadeIn();
			} else {
				$(parent_box_attr).append(result).fadeIn();
			}
			$.each(post_data, function(key, val) {
				var input_attr = '#input_' + key;
				if ($(input_attr) != null) $(input_attr).val('');
			});
			$.jGrowl('profile 選択肢を作成しました。');
		},
		error: function(result){
			$.jGrowl(get_error_message(result['status'], 'profile 選択肢の作成に失敗しました。'));
		}
	});
}

function display_form4value(value, target_values, disp_target_forms) {
	var prefix  = (arguments.length > 3 && arguments[3]) ? arguments[3] : '#form_';
	var suffix  = (arguments.length > 4 && arguments[4]) ? arguments[4] : '_block';

	if ($.inArray(value, target_values) == -1) {
		disp_target_forms.forEach(function(target) {
			var block = $(prefix + target + suffix);
			if (block.hasClass('hidden') == false) block.addClass('hidden');
		});
	} else {
		disp_target_forms.forEach(function(target) {
			var block = $(prefix + target + suffix);
			if (block.hasClass('hidden') == true) block.removeClass('hidden');
		});
	}
}

function update_follow_status(selfDomElement) {
	var id = $(selfDomElement).data('id');
	var selfDomElement_html = $(selfDomElement).html();

	var post_data = {'id': id};
	post_url = get_url('member/relation/api/update/follow.json');
	post_data = set_token(post_data);

	var ret = false;
	$.ajax({
		url : post_url,
		type : 'POST',
		dataType : 'text',
		data : post_data,
		timeout: 10000,
		beforeSend: function(xhr, settings) {
			GL.execute_flg = true;
			if (selfDomElement) {
				$(selfDomElement).attr('disabled', true);
				$(selfDomElement).html(get_loading_image_tag());
			}
		},
		complete: function(xhr, textStatus) {
			GL.execute_flg = false;
			$(selfDomElement).attr('disabled', false);
		},
		success: function(result){
			var message
					resData = $.parseJSON(result);
			if (resData.status) {
				$(selfDomElement).addClass('btn-primary');
				selfDomElement_html = '<span class="glyphicon glyphicon-ok"></span> ' + get_term('follow') + '中';
				msg = get_term('follow') + 'しました。';
			} else {
				$(selfDomElement).removeClass('btn-primary');
				selfDomElement_html = get_term('follow') + 'する';
				msg = get_term('follow') + 'を解除しました。';
			}
			$.jGrowl(msg);
			$(selfDomElement).html(selfDomElement_html);
		},
		error: function(result){
			$(selfDomElement).html(selfDomElement_html);
			$.jGrowl(get_error_message(result['status'], get_term('follow') + 'に失敗しました。'));
		}
	});
}

function execute_post(uri){
	var post_data = (arguments.length > 1) ? arguments[1] : {};

	var post_url = get_url(uri);
	post_data = set_token(post_data);

	$('<form>', {action: post_url, method: 'post', id: 'tmp_form'}).appendTo(document.body);
	var tmp_form = $('#tmp_form');
	$.each(post_data, function(key, val){
		tmp_form.append($('<input>', {type: 'hidden', name: key, value: val}));
	});
	tmp_form.submit();
}

function post_submit(selfDomElement) {
	var post_data = (arguments.length > 1) ? arguments[1] : {};
	var uri = $(selfDomElement).data('uri') ? $(selfDomElement).data('uri') : '';
	var confirm_msg = $(selfDomElement).data('msg') ? $(selfDomElement).data('msg') : '';
	var destination = $(selfDomElement).data('destination') ? $(selfDomElement).data('destination') : '';

	if (destination.length > 0) post_data['destination'] = destination;

	if (confirm_msg.length > 0) {
		apprise(confirm_msg, {'confirm':true}, function(r) {
			if (r == true) execute_post(uri, post_data);
		});
		return;
	}

	execute_post(uri, post_data);
}

function execute_simple_delete(selfDomElement) {
	var post_id  = parseInt($(selfDomElement).data('id'));
	var post_uri  = $(selfDomElement).data('uri');
	var parent_id = $(selfDomElement).data('parent');
	var msg = $(selfDomElement).data('msg') ? $(selfDomElement).data('msg') : '';
	if (!post_id && !post_uri) return false;

	var parent_attr = parent_id ? '#' + parent_id : '#' + post_id;

	delete_item(post_uri, post_id, '', parent_attr, '', msg);
}

function execute_simple_post(selfDomElement) {
	var post_keys = (arguments.length > 1) ? arguments[1] : [];
	var parent_box = $(selfDomElement).data('parent_box') ? $(selfDomElement).data('parent_box') : 'jqui-sortable';
	var post_uri = $(selfDomElement).data('uri');
	if (!post_uri) return false;

	var post_data = {};
	var has_error = false;
	if (post_keys.length > 0) {
		$.each(post_keys, function(i, post_key) {
			var input_attr = '#input_' + post_key;
			var value = $(input_attr).val().trim();
			if (value.length == 0) {
				has_error = true;
				return false;
			}
			post_data[post_key] = value;
		});
	} else {
		var input_name = $(selfDomElement).data('input_name') ? $(selfDomElement).data('input_name') : 'name';
		var input_attr = '#input_' + input_name;
		var value = $(input_attr).val().trim();
		if (!value.length) return false;
		post_data[input_name] = value;
	}
	if (has_error) return false;

	var id = $(selfDomElement).data('id') ? parseInt($(selfDomElement).data('id')) : 0;
	if (id > 0) post_data['id'] = id;
	var msg_success = '作成しました。';
	var msg_error = '作成に失敗しました。';
	send_article(selfDomElement, post_data, post_uri, '#' + parent_box, false, msg_success, msg_error);
}