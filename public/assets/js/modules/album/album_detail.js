$('.carousel').carousel({
	interval: false
})

$(function(){
	load_masonry_item(
		'#main_container',
		'.main_item',
		get_term('album_image') + 'がありません。'
	);
});

$('.link_album_image_delete').live("click", function(){
	delete_item('album/image/api/delete.json', get_id_num(($(this).attr("id"))), '#main_item');
	return false;
});
$('.link_album_image_set_cover').live("click", function(){
	set_cover(get_id_num(($(this).attr("id"))));
	return false;
});

$('.btn_album_image_comment_delete').click(function(){
	delete_item('album/image/comment/api/delete.json', get_id_num(($(this).attr("id"))), '#commentBox');
});

if (!is_sp()) {
	$('.commentBox').live({
		mouseenter:function() {
			var id = $(this).attr('id').replace($(this).attr('class') + '_', '');
			var btn = '#btn_album_image_comment_delete_' + id;
			$(btn).fadeIn('fast');
		},
		mouseleave:function() {
			var id = $(this).attr('id').replace($(this).attr('class') + '_', '');
			var btn = '#btn_album_image_comment_delete_' + id;
			$(btn).hide();
		}
	});
	$('.imgBox').live({
		mouseenter:function() {
			var id = $(this).attr('id').replace($(this).attr('class') + '_', '');
			var btn = '#btn_album_image_edit_' + id;
			$(btn).fadeIn('fast');
		},
		mouseleave:function() {
			var id = $(this).attr('id').replace($(this).attr('class') + '_', '');
			var btn = '#btn_album_image_edit_' + id;
			$(btn).hide();
		}
	});
}