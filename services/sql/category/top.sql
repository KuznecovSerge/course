select 
	id,
	productCount as sum,
	(select name from category where id = topcat.id) as name
from 
(
	select coalesce (c.parent, c.id) as id, sum(1) as productCount
	from product_category p inner join category c
	on p.categoryId = c.id
	group by coalesce (c.parent, c.id)
	order by sum(1) desc
) topcat