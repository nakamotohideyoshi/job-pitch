var CONST = {
	APPLICATION: {
		APPLICATION: 'CREATED',
		CONNECTION: 'ESTABLISHED'
	},

	STATUS: {
		APPLICATION: 1,
		CONNECTION: 2,
		DELETED: 3
	},

	USER: {
		JOBSEEKER: 0,
		BUSINESS: 1,
		UNDEFINED: undefined
	},

	ROLE: {
		RECRUITER: 'RECRUITER',
		JOBSEEKER: 'JOB_SEEKER'
	},

	PATH: {
		PARTIALS: "/static/web/partials/"
	},

	SITEMAP: {
		COMMONS: [
      'home',
      'howitworks/job-seeker',
      'howitworks/recruiter',
      'about',
      'terms-conditions'
    ],
		RECRUITER: [
      'profile/job-seeker',
      'find-jobs',
      'job-seeker/messages',
      'applications',
      'profile/job-seeker',
      'profile/job-seeker/edit',
      'profile/notification-settings',
      'profile/job-preferences/edit',
      'profile/job-seeker/edit',
      'password-change'
    ],
		RECRUITER: [
      'profile/recruiter',
      'find-talent',
      'profile/add-work-place',
      'profile/post-a-job',
      'recruiter/messages',
      'find-posts',
      'profile/payments'
    ]
	}
}
