//
//  ListJobs.m
//  My Job Pitch
//
//  Created by user on 10/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ListJobs.h"
#import "SimpleListCell.h"
#import "EditJob.h"
#import "ViewJobMenu.h"

@interface ListJobs () {
    NSArray *data;
}

@end

@implementation ListJobs

- (void)viewDidLoad {
    [super viewDidLoad];
    self.jobs.rowHeight = UITableViewAutomaticDimension;
    self.jobs.estimatedRowHeight = 96;
    self.jobs.dataSource = self;
    self.jobs.delegate = self;
}

-(void)viewWillAppear:(BOOL)animated
{
    [self showProgress:true];
    [self.appDelegate.api loadJobsForLocation:self.location.id success:^(NSArray *jobs) {
        if (jobs.count) {
            data = jobs;
            [self.jobs setHidden:false];
            [self.emptyView setHidden:true];
            [self.jobs reloadData];
        } else {
            [self.jobs setHidden:true];
            [self.emptyView setHidden:false];
        }
        [self showProgress:false];
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        [[[UIAlertView alloc] initWithTitle:@"Error"
                                    message:@"Error loading data"
                                   delegate:self
                          cancelButtonTitle:@"Okay"
                          otherButtonTitles:nil] show];
    }];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if (data)
        return data.count;
    return 0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    SimpleListCell *cell = [self.jobs dequeueReusableCellWithIdentifier:@"SimpleListCell"];
    Job *job = [self->data objectAtIndex:indexPath.row];
    cell.title.text = job.title;
    Image *image = [job getImage];
    if (image) {
        [self loadImageURL:image.thumbnail
                      into:cell.image
             withIndicator:cell.imageActivity];
    } else {
        cell.image.image = nil;
        cell.imageActivity.hidden = true;
    }
    cell.subtitle.text = job.desc;
    cell.backgroundColor = [UIColor clearColor];
    cell.selectedBackgroundView = [[UIView alloc] init];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.5];
    return cell;
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_edit_job"]) {
        EditJob *jobsView = [segue destinationViewController];
        [jobsView setLocation:self.location];
    } else if ([[segue identifier] isEqualToString:@"goto_view_job_menu"]) {
        ViewJobMenu *jobView = [segue destinationViewController];
        Job *selectedJob = [data objectAtIndex:self.jobs.indexPathForSelectedRow.row];
        [jobView setJob:selectedJob];
    }
}

- (IBAction)addJob:(id)sender {
    [self performSegueWithIdentifier:@"goto_edit_job" sender:self];
}
@end
