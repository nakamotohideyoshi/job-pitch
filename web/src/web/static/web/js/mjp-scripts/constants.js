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
		UNDEFINED: "undefined"
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
			'terms-conditions',
			'login',
			'registration'
		],
		JOBSEEKER: [
			'profile/job-seeker',
			'find-jobs',
			'messages',
			'profile/job-seeker',
			'profile/job-seeker/edit',
			'profile/notification-settings',
			'profile/job-preferences/edit',
			'profile/job-seeker/edit',
			'password-change'
		],
		BUSINESS: [
			'applications',
			'find-talent',
			'add-work-place',
			'post-a-job',
			'messages',
			'find-posts',
			'profile/recruiter',
			'profile/recruiter/job-seeker',
			'profile/recruiter/create',
			'profile/recruiter/edit',
			'profile/payments',
			'profile/create-business'
		]
	}
};
