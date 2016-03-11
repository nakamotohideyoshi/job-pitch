//
//  ListLocations.m
//  My Job Pitch
//
//  Created by user on 10/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ListLocations.h"
#import "SimpleListCell.h"
#import "ListJobs.h"
#import "EditLocation.h"

@interface ListLocations () {
    NSArray *data;
}

@end

@implementation ListLocations

- (void)viewDidLoad {
    [super viewDidLoad];
    self.locations.rowHeight = UITableViewAutomaticDimension;
    self.locations.estimatedRowHeight = 96;
    self.locations.dataSource = self;
    self.locations.delegate = self;
}

-(void)viewWillAppear:(BOOL)animated
{
    [self.emptyView setHidden:true];
    [self showProgress:true];
    [self.appDelegate.api loadLocationsForBusiness:self.business.id success:^(NSArray *locations) {
        if (locations.count) {
            data = locations;
            [self.locations setHidden:false];
            [self.emptyView setHidden:true];
            [self.locations reloadData];
        } else {
            [self.locations setHidden:true];
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
    SimpleListCell *cell = [self.locations dequeueReusableCellWithIdentifier:@"SimpleListCell"];
    Location *location = [self->data objectAtIndex:indexPath.row];
    cell.title.text = location.name;
    Image *image = [location getImage];
    if (image) {
        [self loadImageURL:image.thumbnail
                      into:cell.image
             withIndicator:cell.imageActivity];
    } else {
        cell.image.image = nil;
        cell.imageActivity.hidden = true;
    }
    cell.subtitle.text = [NSString stringWithFormat:@"Includes %ld job", location.jobs.count];
    cell.backgroundColor = [UIColor clearColor];
    cell.selectedBackgroundView = [[UIView alloc] init];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.5];
    return cell;
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_jobs_list"]) {
        ListJobs *jobsView = [segue destinationViewController];
        Location *selectedLocation = [data objectAtIndex:self.locations.indexPathForSelectedRow.row];
        [jobsView setLocation:selectedLocation];
    } else if ([[segue identifier] isEqualToString:@"goto_edit_location"]) {
        EditLocation *editView = [segue destinationViewController];
        [editView setBusiness:self.business];
    }
}

- (IBAction)addWorkPlace:(id)sender {
    [self performSegueWithIdentifier:@"goto_edit_location" sender:self];
}

@end
