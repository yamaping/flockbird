<?php
namespace Notice;

class Controller_Api extends \Controller_Site_Api
{
	protected $check_not_auth_action = array(
	);

	public function before()
	{
		parent::before();
	}

	/**
	 * Api list
	 * 
	 * @access  public
	 * @return  Response (html)
	 */
	public function get_list()
	{
		$response = '0';
		try
		{
			$this->check_response_format('json');

			list($limit, $page) = $this->common_get_pager_list_params(\Config::get('notice.articles.limit'), \Config::get('notice.articles.limit_max'));
			$data = Model_NoticeStatus::get_pager_list4member_id($this->u->id, $limit, $page);

			$status_code = 200;
			$list_array = array();
			foreach ($data['list'] as $key => $obj)
			{
				$row = $obj->to_array();
				$row['members_count'] = Model_NoticeMemberFrom::get_count4notice_id($row['notice_id'], $this->u->id);
				$row['members'] = array();
				$notice_member_froms = Model_NoticeMemberFrom::get4notice_id($row['notice_id'], \Config::get('notice.noticeMemberFrom.limit'), $this->u->id);
				foreach ($notice_member_froms as $notice_member_from)
				{
					$row['members'][] = \Model_Member::get_basic_data($notice_member_from->member_id);
				}
				$row['is_read'] = (int)$row['is_read'];
				$list_array[] = $row;
			}
			// json response
			$response = array(
				'status' => 1,
				'list' => $list_array,
				'page' => $data['page'],
				'next_page' => $data['next_page'],
				'is_detail' => (bool)\Input::get('is_detail', 0),
			);
		}
		catch(\HttpNotFoundException $e)
		{
			$status_code = 404;
		}
		catch(\HttpForbiddenException $e)
		{
			$status_code = 403;
		}
		catch(\FuelException $e)
		{
			$status_code = 400;
		}

		$this->response($response, $status_code);
	}
}