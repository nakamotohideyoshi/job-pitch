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
#import "MyAlertController.h"

@interface ListJobs () {
    NSArray *data;
}

@property (weak, nonatomic) IBOutlet UITableView *jobs;
@property (weak, nonatomic) IBOutlet UIView *emptyView;

@end

@implementation ListJobs

- (void)viewDidLoad {
    [super viewDidLoad];
    self.jobs.allowsMultipleSelectionDuringEditing = NO;
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
        [MyAlertController title:@"Error" message:@"Error loading data" ok:@"Okay" okCallback:nil cancel:nil cancelCallback:nil];
    }];
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 85;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return data ? data.count : 0;
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
    
    [cell.editButton removeTarget:self action:@selector(editJob:) forControlEvents:UIControlEventTouchUpInside];
    [cell.editButton addTarget:self action:@selector(editJob:) forControlEvents:UIControlEventTouchUpInside];
    cell.editButton.tag = indexPath.row;
    return cell;
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
    // Return YES if you want the specified item to be editable.
    return NO;
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        //add code here for when you hit delete
    }
}

- (void) editJob:(UIButton*)sender {
    EditJob *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"EditJob"];
    controller.location = _location;
    if (sender != nil) {
        controller.job = [self->data objectAtIndex:sender.tag];
    }
    [self.navigationController pushViewController:controller animated:YES];
}

- (IBAction)addJob:(id)sender {
    [self editJob:nil];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_view_job_menu"]) {
        ViewJobMenu *controller = [segue destinationViewController];
        NSInteger index = self.jobs.indexPathForSelectedRow.row;
        controller.job = [self->data objectAtIndex:index];
    }
}

@end
