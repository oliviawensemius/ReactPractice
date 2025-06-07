const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/lecturer-search';

// unified search: POST /api/lecturer-search/search
export async function searchLecturerApplications({
  applicationIds,
  name,
  availability,
  skills,
  sessionType,
  sort_by,
  sort_direction,
}: {
  applicationIds?: string[];
  name?: string;
  availability?: 'fulltime' | 'parttime';
  skills?: string[];
  sessionType?: 'tutor' | 'lab_assistant';
  sort_by?: 'courseName' | 'candidateName';
  sort_direction?: 'asc' | 'desc';
}): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/search`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationIds,
      name,
      availability,
      skills,
      sessionType,
      sort_by,
      sort_direction,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to search applications');
  return data.application_ids;
}
