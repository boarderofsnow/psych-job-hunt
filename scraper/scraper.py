from jobspy import scrape_jobs
import hashlib
from datetime import datetime

# Target locations for psychiatry jobs
LOCATIONS = [
    "Madison, WI",
    "Boulder, CO",
    "Fort Collins, CO",
    "Raleigh, NC",
    "Durham, NC"
]

# Search terms for psychiatry positions
SEARCH_TERMS = [
    "psychiatrist",
    "psychiatry",
]

# Exclude jobs with these terms in the title (case-insensitive)
EXCLUDED_TITLES = [
    "nurse practitioner",
    "np ",
    " np",
    "aprn",
    "registered nurse",
    " rn ",
    " rn,",
    "psychologist",
    "social worker",
    "nurse",
    "nursing",
    "counselor",
    "counseler",
    "neurologist",
    "epileptologist",
]

def should_exclude_job(title):
    """Check if a job should be excluded based on title."""
    if not title:
        return False
    title_lower = title.lower()
    for excluded in EXCLUDED_TITLES:
        if excluded in title_lower:
            return True
    return False

def generate_external_id(job):
    """Generate a unique ID for a job based on its key attributes."""
    unique_string = f"{job.get('title', '')}{job.get('company', '')}{job.get('location', '')}{job.get('job_url', '')}"
    return hashlib.md5(unique_string.encode()).hexdigest()

def scrape_location(location, search_term):
    """Scrape jobs for a specific location and search term."""
    jobs = []

    try:
        print(f"Scraping {search_term} jobs in {location}...")

        results = scrape_jobs(
            site_name=["indeed", "linkedin", "glassdoor"],
            search_term=search_term,
            location=location,
            results_wanted=50,
            hours_old=168,  # Last 7 days
            country_indeed='USA'
        )

        if results is not None and len(results) > 0:
            for _, row in results.iterrows():
                job = {
                    'external_id': generate_external_id(row.to_dict()),
                    'title': str(row.get('title', '')) if row.get('title') else None,
                    'company': str(row.get('company', '')) if row.get('company') else None,
                    'location': str(row.get('location', '')) if row.get('location') else None,
                    'description': str(row.get('description', '')) if row.get('description') else None,
                    'url': str(row.get('job_url', '')) if row.get('job_url') else None,
                    'salary_min': int(row.get('min_amount')) if row.get('min_amount') and not str(row.get('min_amount')).lower() == 'nan' else None,
                    'salary_max': int(row.get('max_amount')) if row.get('max_amount') and not str(row.get('max_amount')).lower() == 'nan' else None,
                    'date_posted': str(row.get('date_posted', ''))[:10] if row.get('date_posted') else None,
                    'source': str(row.get('site', '')) if row.get('site') else None,
                    'search_location': location
                }
                jobs.append(job)

            print(f"Found {len(results)} jobs for {search_term} in {location}")
        else:
            print(f"No results for {search_term} in {location}")

    except Exception as e:
        print(f"Error scraping {search_term} in {location}: {str(e)}")

    return jobs

def scrape_all_locations():
    """Scrape all locations for all search terms."""
    all_jobs = []
    seen_ids = set()

    for location in LOCATIONS:
        for search_term in SEARCH_TERMS:
            jobs = scrape_location(location, search_term)

            for job in jobs:
                # Deduplicate by external_id and filter excluded titles
                if job['external_id'] not in seen_ids:
                    if should_exclude_job(job.get('title')):
                        continue
                    seen_ids.add(job['external_id'])
                    all_jobs.append(job)

    print(f"Total unique jobs found: {len(all_jobs)}")
    return all_jobs

if __name__ == '__main__':
    # Test scraping
    jobs = scrape_all_locations()
    print(f"Found {len(jobs)} total unique jobs")
    for job in jobs[:5]:
        print(f"  - {job['title']} at {job['company']} in {job['location']}")
