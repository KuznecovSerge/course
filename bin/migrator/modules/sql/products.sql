select
	tgg_with_goods_and_groups.good_id,
	tgg_with_goods_and_groups.user_id as authorId,
	tgg_with_goods_and_groups.title,
	tgg_with_goods_and_groups.description,
	tgg_with_goods_and_groups.price,
	tgg_with_goods_and_groups.category,
	tgg_with_goods_and_groups.name as trainingGroupName,
	coalesce(
		nullif(tgg_with_goods_and_groups.new_img, ''),
		tgg_with_goods_and_groups.img
	) as image
from
	training_access ta
	inner join (
		select
			tgg_with_goods.title,
			tgg_with_goods.description,
			tgg_with_goods.price,
			tgg_with_goods.category,
			tgg_with_goods.good_id,
			tgg_with_goods.user_id,
			tgg_with_goods.img,
			tgg_with_goods.new_img,
			tg.name,
			tg.training_group_id
		from
			training_groups tg
			inner join (
				select
					gwc.title,
					gwc.description,
					gwc.price,
					gwc.category,
					gwc.good_id,
					gwc.user_id,
					gwc.img,
					gwc.new_img,
					tgg.training_group_id
				from
					training_group_goods tgg
					inner join (
						select
							g.title,
							g.description,
							g.good_id,
							g.user_id,
							g.price,
							g.img,
							g.new_img,
							t.name as category
						from
							goods g
							inner join training_group_goods tgg on tgg.good_id = g.good_id
							left join good_category2theme gct on gct.good_category_id = g.good_category_id
							left join thematics t on t.theme_id = gct.theme_id
						where
							g.published = 1
							and g.del = 0
					) gwc on tgg.good_id = gwc.good_id
				group by
					1,
					2,
					3
			) as tgg_with_goods on tgg_with_goods.training_group_id = tg.training_group_id
	) as tgg_with_goods_and_groups on ta.training_group_id = tgg_with_goods_and_groups.training_group_id
where
	ta.`type` = 'training'
group by
	1,
	2;