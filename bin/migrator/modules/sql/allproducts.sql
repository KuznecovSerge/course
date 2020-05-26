select
    children.*,
    (
        case
            when children.img <> '' then concat(
                'https://www.monecle.com/upload/images/goods/100/',
                children.img
            )
            else ''
        end
    ) as image
from
    (
        select
            g.good_id as id,
            g.`date`,
            g.ball,
            1 as producttypeId,
            g.user_id as authorId,
            g.title,
            g.price,
            g.outer_subthematic as categoryId,
            coalesce(nullif(g.new_img, ''), g.img) as img,
            g.content,
            g.description
        from
            goods g
            left join thematics_from_monecle_curses tfmc on tfmc.id = g.outer_subthematic
        where
            g.del = 0
            and g.del_curses = 0
            and g.test = 0
            and g.outer_subthematic != 0
            and g.published = 1
            and g.img <> '' or g.new_img <> ''
    ) as children
group by
    id
order by
    ball desc,
    `date` desc