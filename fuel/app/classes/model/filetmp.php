<?php

class Model_FileTmp extends \MyOrm\Model
{
	protected static $_table_name = 'file_tmp';
	protected static $_has_many = array(
		'file_tmp_config' => array(
			'key_from' => 'id',
			'model_to' => 'Model_FileTmpConfig',
			'key_to' => 'file_tmp_id',
		)
	);
	protected static $_properties = array(
		'id',
		'name' => array(
			'validation' => array('trim', 'required', 'max_length' => array(64)),
		),
		'type' => array(
			'validation' => array('trim', 'max_length' => array(256)),
		),
		'filesize' => array(
			'data_type' => 'integer',
			'validation' => array('trim', 'required', 'valid_string' => array('numeric')),
		),
		'original_filename' => array(
			'validation' => array('trim', 'max_length' => array(255)),
		),
		'member_id' => array(
			'data_type' => 'integer',
			'validation' => array('valid_string' => array('numeric')),
		),
		'user_type' => array(
			'validation' => array('valid_string' => array('integer'), 'in_array' => array(array(0, 1))),
		),
		'description' => array(
			'data_type' => 'text',
			'validation' => array('trim'),
			'form' => array('type' => 'textarea', 'cols' => 60, 'rows' => 2, 'placeholder' => '写真の説明', 'class' => 'col-xs-12'),
		),
		'exif' => array(
			'data_type' => 'text',
			'validation' => array('trim'),
		),
		'shot_at',
		'created_at',
		'updated_at'
	);

	protected static $_observers = array(
		'Orm\Observer_Validation' => array(
			'events' => array('before_save'),
		),
		'Orm\Observer_CreatedAt' => array(
			'events' => array('before_insert'),
			'mysql_timestamp' => true,
		),
		'Orm\Observer_UpdatedAt' => array(
			'events' => array('before_save'),
			'mysql_timestamp' => true,
		),
	);

	public static function _init()
	{
		if (conf('upload.isRemoveOnBatch'))
		{
			static::$_observers['MyOrm\Observer_InsertFileBinDeleteQueue'] = array(
				'events' => array('before_delete'),
				'is_tmp' => true,
			);
		}
		else
		{
			static::$_observers['MyOrm\Observer_RemoveFile'] = array(
				'events' => array('before_delete'),
				'is_tmp' => true,
			);
		}
	}

	public static function check_authority($id, $target_member_id = 0, $related_tables = null, $member_id_prop = 'member_id', $parent_table_with_member_id = null, $user_type = 0)
	{
		$id = (int)$id;
		if (!$id) throw new \HttpNotFoundException;

		$params = array('rows_limit' => 1);
		if (!$obj = self::find($id, $params)) throw new \HttpForbiddenException;

		if ($target_member_id)
		{
			if ($parent_table_with_member_id)
			{
				if (!$related_tables || !in_array($parent_table_with_member_id, $related_tables))
				{
					throw new \InvalidArgumentException('Parameter parent_table_with_member_id is invalid.');
				}
				if ($obj->{$parent_table_with_member_id}->{$member_id_prop} != $target_member_id) throw new \HttpForbiddenException;
			}
			else
			{
				if ($obj->{$member_id_prop} != $target_member_id) throw new \HttpForbiddenException;
			}
			if ($obj->user_type != $user_type) throw new \HttpForbiddenException;
		}

		return $obj;
	}

	public static function get4name_and_member_id($name, $member_id, $user_type)
	{
		$query = self::query()->where('name', $name);
		if ($member_id)
		{
			$query = $query->where('user_type', $user_type)->where('member_id', $member_id);
		}

		return $query->get_one();
	}

	public static function get4name($name)
	{
		return self::query()->where('name', $name)->get_one();
	}
}
