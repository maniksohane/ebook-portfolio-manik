insert into public.ebooks
(title,slug,description,author,price,cover_path,file_path,pages,category,tags,is_published,is_featured)
values
('Dynamics 365 CE Developer Handbook',
'dynamics-365-ce-developer-handbook',
'Practical guide to real-world Dynamics 365 Customer Engagement development, architecture, plugins, JavaScript, integrations, SLAs and case management.',
'Manikya',499,'covers/dynamics-365-ce-developer-handbook.jpg',
'ebooks/dynamics-365-ce-developer-handbook.pdf',250,'Dynamics 365',
array['Dynamics 365 CE','Plugins','JavaScript','Dataverse'],false,true)
on conflict(slug) do nothing;
