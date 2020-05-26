select
	t.training_id as id,
	t.parent_id as parent,
	t.description,
	t.name as name,
	ta.good_id as productId,
	t.user_id as authorId,
	(
	case
		when t.avatar <> '' then concat( 'https://www.monecle.com/upload/images/training/100/', t.avatar )
		else '' end ) as image,
	t.`date`
from
	trainings t
inner join (
	select
		ta.target_id,
		tggwithgood.good_id,
		ta.`type`
	from
		training_access ta
	inner join (
		select
			tgg.training_group_id,
			tgg.good_id
		from
			training_group_goods tgg
		where
			tgg.good_id IN ($GOOD_ID_ARR)) as tggwithgood on
		ta.training_group_id = tggwithgood.training_group_id ) as ta on
	ta.target_id = t.training_id