<?php

class Site_Lang
{
	public static function get_lang($is_check_member_lang = true, $is_check_session_lang = true)
	{
		$default_lang = get_default_lang();

		if (!is_enabled_i18n()) return $default_lang;
		if (is_admin()) return conf('adminDefaultLang', 'i18n');

		// Member setting
		if ($is_check_session_lang && $lang = Session::get('lang')) return $lang;
		if ($is_check_member_lang  && $member_id = get_uid())
		{
			if ($lang = static::get_member_set_lang($member_id))
			{
				if ($is_check_session_lang) Session::set('lang', $lang);
				return $lang;
			}
		}

		// Client browser setting
		if ($lang = Site_Lang::get_client_lang()) return $lang;

		return $default_lang;
	}

	public static function configure_lang($is_check_member_lang = true, $is_check_session_lang = true)
	{
		$lang = static::get_lang($is_check_member_lang, $is_check_session_lang);
		Lang::set_lang($lang, true);
		static::load_lang_files();
		static::load_configs_related_lang($lang);
	}

	public static function reset_lang($lang, $is_set_session = true)
	{
		if ($is_set_session) Session::set('lang', $lang);
		Lang::set_lang($lang, true);
		static::load_lang_files();
		static::load_configs_related_lang($lang);
	}

	protected static function load_lang_files()
	{
		if ($lang_files = Config::get('i18n.lang.files'))
		{
			foreach ($lang_files as $lang_file) Lang::load($lang_file, null, null, true, true);
		}
	}

	protected static function load_configs_related_lang($lang)
	{
		Config::load(Site_Util::get_term_file_name($lang), 'term', true);
		Config::load(is_admin() ? 'admin::navigation' : 'navigation', 'navigation', true);
	}

	public static function get_client_lang($is_return_default_lang = false)
	{
		$accepteds = array_keys(conf('lang.options', 'i18n'));
		if (! $set_langs = Util_Lang::get_client_accept_lang(true))
		{
			return $is_return_default_lang ? get_default_lang() : false;
		}

		foreach ($set_langs as $lang)
		{
			if (in_array($lang, $accepteds)) return  $lang;
		}

		return $is_return_default_lang ? get_default_lang() : false;
	}

	public static function get_member_set_lang($member_id)
	{
		if (! $lang = Model_MemberConfig::get_value($member_id, 'lang')) return false;

		return $lang;
	}
}
