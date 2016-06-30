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
#import "CreateRecruiterProfile.h"
#import "MyAlertController.h"

@interface ListLocations () {
    NSArray *data;
}

@property (weak, nonatomic) IBOutlet UITableView *locations;
@property (weak, nonatomic) IBOutlet UIView *emptyView;

@end

@implementation ListLocations

- (void)viewDidLoad {
    [super viewDidLoad];
    self.locations.allowsMultipleSelectionDuringEditing = NO;
}

-(void)viewWillAppear:(BOOL)animated {
    [self.emptyView setHidden:true];
    [self showProgress:true];
    [self.appDelegate.api loadLocationsForBusiness:self.business.id success:^(NSArray *locations) {
        if (locations.count) {
            data = locations;
            [self.locations setHidden:false];
            [self.locations reloadData];
        } else {
            [self.locations setHidden:true];
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

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
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
    if (location.jobs.count == 1)
        cell.subtitle.text = [NSString stringWithFormat:@"Includes %u job", location.jobs.count];
    else
        cell.subtitle.text = [NSString stringWithFormat:@"Includes %u jobs", location.jobs.count];
    cell.backgroundColor = [UIColor clearColor];
    cell.selectedBackgroundView = [[UIView alloc] init];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.5];
    
    UIButton *editButton = [cell viewWithTag:100];
    [editButton removeTarget:self action:@selector(editLocation) forControlEvents:UIControlEventTouchUpInside];
    [editButton addTarget:self action:@selector(editLocation) forControlEvents:UIControlEventTouchUpInside];
    
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

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    ListJobs *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"ListJobs"];
    NSInteger index = self.locations.indexPathForSelectedRow.row;
    controller.location = [self->data objectAtIndex:index];
    [self.navigationController pushViewController:controller animated:YES];
}

- (void) editLocation {
    CreateRecruiterProfile *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"CreateRecruiterProfile"];
    controller.hiddenBusiness = YES;
    controller.business = _business;
    if (self.locations.indexPathForSelectedRow != nil) {
        NSInteger index = self.locations.indexPathForSelectedRow.row;
        controller.location = [self->data objectAtIndex:index];
    }
    [self.navigationController pushViewController:controller animated:YES];
}

- (IBAction)addWorkPlace:(id)sender {
    [self editLocation];
}

@end
