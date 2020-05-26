select
    u.user_id as id,
    email,
    pass as password,
    name as firstName,
    fename as lastName,
    phone as numberPhone,
    (
	case
		when u.avatar <> '' then concat( 'https://monecle.com/upload/avatar/600/', u.avatar)
		else '' end ) as avatar,
    vt
.vk_id as vk_user_id,
    tu.chat_id as tg_chat_id
from
    users u
    left join vk_users_tokens vt on
	vt.user_id = u.user_id
    left join telegram_users tu on
	tu.user_id = u.user_id;
