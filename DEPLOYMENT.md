# Deployment Playbook

Follow this checklist to ship Coding Kickstarter to Vercel with the Supabase history features enabled.

## 1. Prepare Supabase

1. Create (or open) your Supabase project.
2. Run the schema SQL below in the SQL Editor to create the `generated_sprints` table:

```sql
create table if not exists generated_sprints (
  id uuid primary key default uuid_generate_v4(),
  idea text not null,
  questions jsonb,
  top_steps jsonb,
  blueprint jsonb,
  created_at timestamp default now()
);

alter table generated_sprints enable row level security;
create policy "anon read" on generated_sprints for select using (true);
```

> Tip: If you previously stored `output_json`, keep the column around until you no longer need legacy rows. The History page will read either format.

## 2. Configure environment variables

Set the variables below locally (`.env.local`) and in the Vercel dashboard:

| Name | Description | Scope |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (needed for inserts) | Server-only |
| `OPENAI_API_KEY` | OpenAI API key | Server-only |

Restart `npm run dev` after adding new variables so the Edge runtimes pick them up.

## 3. Deploy on Vercel

1. Push your changes to GitHub.
2. From the Vercel dashboard, **Import Project** → choose the repository.
3. Configure the environment variables above (repeat for Production and Preview).
4. Trigger the first deployment. Subsequent pushes to `main` will auto-deploy.

## 4. Post-deploy checks

- Visit `/` and generate a sprint.
- Click **Save Sprint** and confirm the success toast.
- Open `/history` and verify the new sprint appears with questions, steps, and Kanban markdown.
- Use **Download PDF** to ensure the PDF renders with the gradient header.

All set! 🎉

